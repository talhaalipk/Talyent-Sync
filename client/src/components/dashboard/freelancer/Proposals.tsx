import { useEffect } from "react";
import { useProposalStore } from "../../../store/useProposal";
import ProposalCard from "./ProposalCard";

export default function Proposals() {
  const { proposals, loading, fetchSentProposals } = useProposalStore();

  useEffect(() => {
    fetchSentProposals({ page: 1, limit: 5 }); // default
  }, [fetchSentProposals]);

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500 animate-pulse">Loading proposals...</div>
    );
  }

  if (!proposals || proposals.length === 0) {
    return <div className="py-10 text-center text-gray-400">No proposals found.</div>;
  }

  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">My Proposals</h2>
      <div className="grid gap-4">
        {proposals.map((proposal) => (
          <ProposalCard key={proposal._id} proposal={proposal} />
        ))}
      </div>
    </section>
  );
}
