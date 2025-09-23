import { useEffect } from "react";
import { useProposalStore } from "../../../store/useProposal";
import ReceivedProposalCard from "./ReceivedProposalCard";

export default function ReceivedProposals() {
  const { receivedProposals, loading, fetchReceivedProposals } = useProposalStore();

  useEffect(() => {
    fetchReceivedProposals({ page: 1, limit: 5 });
  }, [fetchReceivedProposals]);

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500 animate-pulse">
        Loading received proposals...
      </div>
    );
  }

  if (!receivedProposals || receivedProposals.length === 0) {
    return <div className="py-10 text-center text-gray-400">No proposals received yet.</div>;
  }

  return (
    <section className="bg-white rounded-2xl p-6 ">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Received Proposals</h2>
      <div className="grid gap-4">
        {receivedProposals.map((proposal) => (
          <ReceivedProposalCard key={proposal._id} proposal={proposal} />
        ))}
      </div>
    </section>
  );
}
