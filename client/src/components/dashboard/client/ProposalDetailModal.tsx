import { useProposalStore, type Proposal } from "../../../store/useProposal";
import { DollarSign, Clock, Star, Download, Eye } from "lucide-react";

export default function ProposalDetailModal({
  proposal,
  onClose,
}: {
  proposal: Proposal;
  onClose: () => void;
}) {
  const { updateProposalStatus } = useProposalStore();

  // Function to handle PDF download
  const handleDownload = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || "proposal-document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  // Function to get Cloudinary PDF preview URL
  const getCloudinaryPreviewUrl = (originalUrl: string) => {
    // If it's already a Cloudinary URL, we can add transformations for better preview
    if (originalUrl.includes("cloudinary.com")) {
      // Add transformations for PDF preview - convert first page to image
      const urlParts = originalUrl.split("/upload/");
      if (urlParts.length === 2) {
        return `${urlParts[0]}/upload/f_jpg,pg_1,w_800,h_600,c_fit/${urlParts[1]}`;
      }
    }
    return originalUrl;
  };

  // Function to open PDF in new tab with proper viewer
  const openPDFViewer = (url: string) => {
    // For better PDF viewing experience
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(viewerUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <img
            src={proposal.senderId?.profilePic || "/default-avatar.png"}
            alt={proposal.senderId?.name || "Freelancer"}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <p className="text-lg font-semibold text-gray-900">{proposal.senderId?.name}</p>
            <p className="text-sm text-gray-500">@{proposal.senderId?.UserName}</p>
            <p className="flex items-center gap-1 text-sm text-yellow-600 mt-1">
              <Star size={14} /> {proposal.senderId?.freelancerProfile?.ratingAvg ?? "N/A"}
            </p>
          </div>
        </div>

        {/* Proposal Details */}
        <h3 className="text-xl font-bold text-[#134848] mb-3">{proposal.jobId?.title}</h3>
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">{proposal.proposalDesc}</p>
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          Job Type : {proposal.jobId?.jobType}
        </p>

        {/* PDF Document Preview & Download */}
        {proposal.document && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-semibold text-gray-800">Attached Document</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => openPDFViewer(proposal.document)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye size={16} /> Preview
                </button>
                <button
                  onClick={() => handleDownload(proposal.document, `proposal-${proposal._id}.pdf`)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Download size={16} /> Download
                </button>
              </div>
            </div>

            {/* PDF Preview Container */}
            <div className="w-full border rounded-lg overflow-hidden bg-gray-50">
              {/* Try to show preview image first (converted from PDF first page) */}
              <div className="relative">
                <img
                  src={getCloudinaryPreviewUrl(proposal.document)}
                  alt="Document preview"
                  className="w-full h-64 object-contain bg-white"
                  onError={(e) => {
                    // If preview image fails, show a placeholder
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const container = target.parentElement;
                    if (container) {
                      container.innerHTML = `
                        <div class="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-500">
                          <div class="text-center">
                            <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>PDF Document</p>
                            <p class="text-sm">Click Preview to view</p>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bid & Delivery */}
        <div className="flex items-center justify-between text-sm text-gray-700 mb-6">
          <span className="flex items-center gap-1 font-medium">
            <DollarSign size={16} className="text-gray-500" />${proposal.bidAmount}
          </span>
          {proposal.estimatedDelivery && (
            <span className="flex items-center gap-1">
              <Clock size={16} className="text-gray-400" />
              {proposal.estimatedDelivery}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center border-t pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back
          </button>

          {proposal.status !== "accepted" && proposal.status !== "rejected" && (
            <div className="flex gap-2">
              <button
                onClick={() => updateProposalStatus(proposal._id, "accepted")}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => updateProposalStatus(proposal._id, "rejected")}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => updateProposalStatus(proposal._id, "shortlisted")}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Shortlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
