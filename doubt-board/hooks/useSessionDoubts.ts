"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSocket } from "@/hooks/useSocket";
import { api } from "@/lib/api-client";
import type { DoubtDTO } from "@/lib/serialize";
import type { SessionDTO } from "@/lib/sessions";

export const doubtsKey = (sessionId: string) => ["doubts", sessionId] as const;
export const sessionKey = (sessionId: string) => ["session", sessionId] as const;

/** Most upvoted first, then oldest first — same order as the API. */
export function rankDoubts(list: DoubtDTO[]) {
  return [...list].sort((a, b) => b.upvoteCount - a.upvoteCount || a.createdAt.localeCompare(b.createdAt));
}

/**
 * Everything a live session page needs: the session, its doubts (kept fresh by
 * socket events), the live student count, and the mutations.
 */
export function useSessionDoubts(sessionId: string) {
  const qc = useQueryClient();
  const { socket, connected } = useSocket();
  const [presence, setPresence] = useState(0);
  const hasConnected = useRef(false);

  const sessionQuery = useQuery({
    queryKey: sessionKey(sessionId),
    queryFn: () => api<{ session: SessionDTO }>(`/api/sessions/${sessionId}`).then((r) => r.session),
  });

  const doubtsQuery = useQuery({
    queryKey: doubtsKey(sessionId),
    queryFn: () => api<{ doubts: DoubtDTO[] }>(`/api/sessions/${sessionId}/doubts`).then((r) => r.doubts),
  });

  const setDoubts = useCallback(
    (fn: (list: DoubtDTO[]) => DoubtDTO[]) =>
      qc.setQueryData<DoubtDTO[]>(doubtsKey(sessionId), (old) => (old ? fn(old) : old)),
    [qc, sessionId],
  );

  const upsert = useCallback(
    (doubt: DoubtDTO) =>
      setDoubts((list) =>
        list.some((d) => d.id === doubt.id) ? list.map((d) => (d.id === doubt.id ? doubt : d)) : [...list, doubt],
      ),
    [setDoubts],
  );

  // Live updates.
  useEffect(() => {
    if (!socket) return;

    const join = () => {
      socket.emit("session:join", { sessionId }, (res) => {
        if (!res.ok) toast.error(res.error ?? "Couldn't join live updates");
      });
      // After a reconnect we may have missed events — refetch everything.
      if (hasConnected.current) {
        qc.invalidateQueries({ queryKey: doubtsKey(sessionId) });
        qc.invalidateQueries({ queryKey: sessionKey(sessionId) });
      }
      hasConnected.current = true;
    };

    const onUpvoted = ({ doubtId, upvoteCount }: { doubtId: string; upvoteCount: number }) =>
      setDoubts((list) => list.map((d) => (d.id === doubtId ? { ...d, upvoteCount } : d)));
    const onDeleted = ({ doubtId }: { doubtId: string }) => setDoubts((list) => list.filter((d) => d.id !== doubtId));
    const onEnded = ({ endedAt }: { endedAt: string }) =>
      qc.setQueryData<SessionDTO>(sessionKey(sessionId), (s) => (s ? { ...s, isActive: false, endedAt } : s));
    const onPresence = ({ sessionId: sid, count }: { sessionId: string; count: number }) => {
      if (sid === sessionId) setPresence(count);
    };

    if (socket.connected) join();
    socket.on("connect", join);
    socket.on("doubt:created", upsert);
    socket.on("doubt:answered", upsert);
    socket.on("doubt:upvoted", onUpvoted);
    socket.on("doubt:deleted", onDeleted);
    socket.on("session:ended", onEnded);
    socket.on("presence:count", onPresence);

    return () => {
      socket.emit("session:leave", { sessionId });
      socket.off("connect", join);
      socket.off("doubt:created", upsert);
      socket.off("doubt:answered", upsert);
      socket.off("doubt:upvoted", onUpvoted);
      socket.off("doubt:deleted", onDeleted);
      socket.off("session:ended", onEnded);
      socket.off("presence:count", onPresence);
    };
  }, [socket, sessionId, qc, setDoubts, upsert]);

  // Mutations.
  const createDoubt = useMutation({
    mutationFn: (input: { text: string; topic: string; isAnonymous: boolean }) =>
      api<{ doubt: DoubtDTO }>(`/api/sessions/${sessionId}/doubts`, { method: "POST", body: input }),
    onSuccess: ({ doubt }) => upsert(doubt),
  });

  const toggleUpvote = useMutation({
    mutationFn: (doubtId: string) =>
      api<{ doubtId: string; upvoteCount: number; hasUpvoted: boolean }>(`/api/doubts/${doubtId}/upvote`, {
        method: "POST",
      }),
    // Optimistic: flip immediately, reconcile with the server's answer.
    onMutate: (doubtId) => {
      const prev = qc.getQueryData<DoubtDTO[]>(doubtsKey(sessionId));
      setDoubts((list) =>
        list.map((d) =>
          d.id === doubtId
            ? { ...d, hasUpvoted: !d.hasUpvoted, upvoteCount: d.upvoteCount + (d.hasUpvoted ? -1 : 1) }
            : d,
        ),
      );
      return { prev };
    },
    onSuccess: ({ doubtId, upvoteCount, hasUpvoted }) =>
      setDoubts((list) => list.map((d) => (d.id === doubtId ? { ...d, upvoteCount, hasUpvoted } : d))),
    onError: (err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(doubtsKey(sessionId), ctx.prev);
      toast.error(err.message);
    },
  });

  const answerDoubt = useMutation({
    mutationFn: ({ doubtId, answer }: { doubtId: string; answer?: string }) =>
      api<{ doubt: DoubtDTO }>(`/api/doubts/${doubtId}/answer`, { method: "PATCH", body: { answer } }),
    onSuccess: ({ doubt }) => upsert(doubt),
    onError: (err) => toast.error(err.message),
  });

  const deleteDoubt = useMutation({
    mutationFn: (doubtId: string) => api(`/api/doubts/${doubtId}`, { method: "DELETE" }),
    onSuccess: (_r, doubtId) => setDoubts((list) => list.filter((d) => d.id !== doubtId)),
    onError: (err) => toast.error(err.message),
  });

  const { open, answered } = useMemo(() => {
    const all = doubtsQuery.data ?? [];
    return {
      open: rankDoubts(all.filter((d) => d.status === "open")),
      answered: rankDoubts(all.filter((d) => d.status === "answered")),
    };
  }, [doubtsQuery.data]);

  return {
    session: sessionQuery.data,
    sessionError: sessionQuery.error,
    isLoading: doubtsQuery.isLoading || sessionQuery.isLoading,
    open,
    answered,
    presence,
    connected,
    createDoubt,
    toggleUpvote,
    answerDoubt,
    deleteDoubt,
  };
}
