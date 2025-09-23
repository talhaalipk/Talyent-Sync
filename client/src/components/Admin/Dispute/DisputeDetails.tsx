// src/components/Admin/Dispute/DisputeDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { useDisputeStore } from "../../../store/Admin/disputeStore";
import ResolutionModal from "./ResolutionModal";

const DisputeDetails = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionType, setResolutionType] = useState<"freelancer" | "client">("freelancer");

  const {
    disputeDetails,
    detailsLoading,
    resolvingToFreelancer,
    resolvingToClient,
    fetchDisputeDetails,
    resolveToFreelancer,
    resolveToClient,
    clearDisputeDetails,
  } = useDisputeStore();

  useEffect(() => {
    if (contractId) {
      fetchDisputeDetails(contractId);
    }
    return () => clearDisputeDetails();
  }, [contractId, fetchDisputeDetails, clearDisputeDetails]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleResolution = async (type: "freelancer" | "client", note: string) => {
    if (!contractId) return;

    const success =
      type === "freelancer"
        ? await resolveToFreelancer(contractId, note)
        : await resolveToClient(contractId, note);

    if (success) {
      setShowResolutionModal(false);
      setTimeout(() => {
        navigate("/admin/dashboard/dispute-management");
      }, 1500);
    }
  };

  const openResolutionModal = (type: "freelancer" | "client") => {
    setResolutionType(type);
    setShowResolutionModal(true);
  };

  if (detailsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#134848] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dispute details...</p>
        </div>
      </div>
    );
  }

  if (!disputeDetails) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Dispute Not Found</h3>
        <p className="text-gray-600 mb-4">The requested dispute could not be found.</p>
        <button
          onClick={() => navigate("/admin/dashboard/dispute-management")}
          className="px-4 py-2 bg-[#134848] text-white rounded-lg hover:bg-[#134848]/90"
        >
          Back to Disputes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/dashboard/dispute-management")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#134848]">Dispute Resolution</h1>
          <p className="text-gray-600">Resolve contract dispute and release payments</p>
        </div>
      </div>

      {/* Contract Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#134848] mb-4">Contract Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Job Title</p>
            <p className="font-semibold text-[#134848]">{disputeDetails.jobId.title}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Contract Type</p>
            <p className="font-semibold text-[#134848] capitalize">{disputeDetails.type}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="font-semibold text-green-600">
              {formatCurrency(disputeDetails.totalAmount)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Escrow Balance</p>
            <p className="font-semibold text-blue-600">
              {formatCurrency(disputeDetails.escrowBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Parties Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#134848]">Client</h3>
              <p className="text-sm text-gray-600">Contract Buyer</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <img
              src={disputeDetails.clientId.profilePic}
              alt={disputeDetails.clientId.UserName}
              className="w-16 h-16 rounded-full border-2 border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(disputeDetails.clientId.UserName)}&background=134848&color=fff`;
              }}
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{disputeDetails.clientId.UserName}</p>
              <p className="text-sm text-gray-600">{disputeDetails.clientId.email}</p>
              {disputeDetails.clientId.clientProfile?.location && (
                <p className="text-sm text-gray-500">
                  {disputeDetails.clientId.clientProfile.location}
                </p>
              )}
            </div>
          </div>

          {disputeDetails.clientId.clientProfile?.companyName && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {disputeDetails.clientId.clientProfile.companyName}
              </p>
              {disputeDetails.clientId.clientProfile.companyDescription && (
                <p className="text-sm text-gray-600 mt-1">
                  {disputeDetails.clientId.clientProfile.companyDescription}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Freelancer Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#134848]">Freelancer</h3>
              <p className="text-sm text-gray-600">Service Provider</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <img
              src={disputeDetails.freelancerId.profilePic}
              alt={disputeDetails.freelancerId.UserName}
              className="w-16 h-16 rounded-full border-2 border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(disputeDetails.freelancerId.UserName)}&background=134848&color=fff`;
              }}
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{disputeDetails.freelancerId.UserName}</p>
              <p className="text-sm text-gray-600">{disputeDetails.freelancerId.email}</p>
              {disputeDetails.freelancerId.freelancerProfile?.location && (
                <p className="text-sm text-gray-500">
                  {disputeDetails.freelancerId.freelancerProfile.location}
                </p>
              )}
              {disputeDetails.freelancerId.freelancerProfile?.hourlyRate && (
                <p className="text-sm text-green-600 font-medium">
                  Average Hourly rate : ${disputeDetails.freelancerId.freelancerProfile.hourlyRate}
                  /hour
                </p>
              )}
            </div>
          </div>

          {disputeDetails.freelancerId.freelancerProfile?.skills && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1">
                {disputeDetails.freelancerId.freelancerProfile.skills
                  .slice(0, 5)
                  .map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hour Tracking (for hourly contracts) */}
      {disputeDetails.type === "hourly" &&
        disputeDetails.Hourtract &&
        disputeDetails.Hourtract.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#134848] mb-4">Hour Tracking</h3>
            <div className="space-y-3">
              {disputeDetails.Hourtract.map((hour, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{hour.title}</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{hour.hoursWork} hours</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          hour.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : hour.status === "reject"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {hour.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{hour.description}</p>
                  {hour.completedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Completed: {formatDate(hour.completedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Resolution Actions */}
      {disputeDetails.status === "disputed" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#134848] mb-4">Resolve Dispute</h3>
          <p className="text-gray-600 mb-6">
            Choose who should receive the escrowed payment for this contract. This action is final
            and cannot be undone.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => openResolutionModal("freelancer")}
              disabled={resolvingToFreelancer || resolvingToClient}
              className="flex items-center justify-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="text-blue-600" size={20} />
              <div className="text-left">
                <p className="font-semibold text-blue-600">Release to Freelancer</p>
                <p className="text-sm text-gray-600">Award payment to service provider</p>
              </div>
              {resolvingToFreelancer && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
            </button>

            <button
              onClick={() => openResolutionModal("client")}
              disabled={resolvingToFreelancer || resolvingToClient}
              className="flex items-center justify-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DollarSign className="text-green-600" size={20} />
              <div className="text-left">
                <p className="font-semibold text-green-600">Refund to Client</p>
                <p className="text-sm text-gray-600">Return payment to buyer</p>
              </div>
              {resolvingToClient && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
              )}
            </button>
          </div>
        </div>
      )}

      {disputeDetails.status === "admin_approved" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <h3 className="font-semibold text-green-800">Dispute Resolved</h3>
              <p className="text-green-700">
                This dispute has been successfully resolved by an administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      <ResolutionModal
        isOpen={showResolutionModal}
        onClose={() => setShowResolutionModal(false)}
        onResolve={handleResolution}
        resolutionType={resolutionType}
        amount={disputeDetails.totalAmount}
        recipientName={
          resolutionType === "freelancer"
            ? disputeDetails.freelancerId.UserName
            : disputeDetails.clientId.UserName
        }
        isResolving={resolvingToFreelancer || resolvingToClient}
      />
    </div>
  );
};

export default DisputeDetails;
