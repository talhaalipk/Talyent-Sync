import { useState } from "react";
import { ArrowLeft, Plus, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../ui/Button";
import api from "../../utils/axiosInstance";
import { useParams } from "react-router-dom";
import { useJobStore } from "../../store/singleJobstore";
import { useNotificationSender } from "../../store/notificationStore";

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProposalModal({ isOpen, onClose }: ProposalModalProps) {
  const { id } = useParams<{ id: string }>();
  const jobId = id;
  const { client, job } = useJobStore(); // Get job details for notification
  const clientId = client._id;
  console.log(clientId);

  // Add notification sender hook - UPDATED FOR NEW STORE
  const { sendNotification, isConnected } = useNotificationSender();

  const [proposal, setProposal] = useState("");
  const [bidAmount, setBidAmount] = useState<number | "">("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [links, setLinks] = useState<{ name: string; url: string }[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  console.log("job details", job);
  if (!isOpen) return null;

  // 🔹 NEW VALIDATION FUNCTIONS
  const validateProposal = (text: string): boolean => {
    if (text.length < 10) {
      toast.error("Proposal must be at least 10 characters long");
      return false;
    }
    if (text.length > 10000) {
      toast.error("Proposal cannot exceed 10,000 characters");
      return false;
    }
    return true;
  };

  const validateBidAmount = (amount: number | ""): boolean => {
    if (amount === "" || amount <= 0) {
      toast.error("Bid amount must be a positive number greater than 0");
      return false;
    }
    return true;
  };

  const validateEstimatedDelivery = (delivery: string): boolean => {
    const numericValue = parseFloat(delivery);
    if (!delivery.trim() || isNaN(numericValue) || numericValue <= 0) {
      toast.error("Estimated delivery must be a positive number greater than 0");
      return false;
    }
    return true;
  };

  const handleAddLink = () => {
    if (!linkName.trim() || !linkUrl.trim()) {
      toast.error("Both Name and URL are required for a portfolio link.");
      return;
    }
    setLinks([...links, { name: linkName.trim(), url: linkUrl.trim() }]);
    setLinkName("");
    setLinkUrl("");
  };

  const handleDeleteLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const resetForm = () => {
    setProposal("");
    setBidAmount("");
    setEstimatedDelivery("");
    setLinkName("");
    setLinkUrl("");
    setLinks([]);
    setFiles([]);
  };

  // 🔹 ENHANCED VALIDATION IN HANDLE SUBMIT
  const handleSubmit = async () => {
    // Validate all fields with custom validation functions
    if (!proposal.trim()) {
      toast.error("Proposal description is required.");
      return;
    }
    if (!validateProposal(proposal.trim())) return;

    if (!bidAmount) {
      toast.error("Bid amount is required.");
      return;
    }
    if (!validateBidAmount(bidAmount)) return;

    if (!estimatedDelivery.trim()) {
      toast.error("Estimated delivery is required.");
      return;
    }
    if (!validateEstimatedDelivery(estimatedDelivery.trim())) return;

    if (!jobId) {
      toast.error("Job ID missing in route params.");
      return;
    }
    if (!clientId) {
      toast.error("Client information missing.");
      return;
    }

    const toastId = toast.loading("Sending proposal..."); // 🔹 Loading toast
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("proposalDesc", proposal.trim());
      formData.append("bidAmount", String(bidAmount));
      formData.append("estimatedDelivery", estimatedDelivery.trim());

      // 🔹 FIXED PORTFOLIO PAYLOAD STRUCTURE
      if (links.length > 0) {
        links.forEach((link, index) => {
          formData.append(`portfolio[${index}][title]`, link.name);
          formData.append(`portfolio[${index}][link]`, link.url);
        });
      }

      if (files.length > 0) {
        files.forEach((file) => formData.append("document", file));
      }

      const res = await api.post("/proposal/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 🔹 UPDATED NOTIFICATION PART - Send notification to client about new proposal
      try {
        const jobTitle = job?.title || "your job"; // Fallback if job title not available
        const proposalId = res.data.proposalId || res.data.data?.proposalId || jobId; // Use proposalId from response or fallback to jobId

        // UPDATED: Use the correct sendNotification method from new store
        sendNotification({
          userId: clientId,
          type: "proposal_received",
          title: "New Proposal Received",
          body: `You received a new proposal for "${jobTitle}"`,
          relatedId: proposalId,
          data: {
            jobId: jobId,
            jobTitle: jobTitle,
            bidAmount: bidAmount,
          },
        });

        console.log(`Notification sent to client ${clientId} for proposal on "${jobTitle}"`);

        // Log connection status for debugging
        if (!isConnected) {
          console.warn("Socket not connected, notification sent via API fallback");
        }
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
        // Don't fail the entire proposal submission if notification fails
      }

      toast.success(res.data.message || "Proposal sent successfully!", { id: toastId }); // ✅ replace toast
      resetForm();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to send proposal";
      toast.error(msg, { id: toastId }); // ✅ replace toast
      resetForm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // 🔹 REAL-TIME VALIDATION HANDLERS
  const handleProposalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setProposal(value);

    // Real-time character count validation
    if (value.length > 10000) {
      toast.error("Proposal cannot exceed 10,000 characters");
    }
  };

  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value ? Number(value) : "";

    // Prevent negative values and zero
    if (numericValue !== "" && numericValue <= 0) {
      toast.error("Bid amount must be greater than 0");
      return;
    }

    setBidAmount(numericValue);
  };

  const handleEstimatedDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEstimatedDelivery(value);

    // Real-time validation for estimated delivery
    if (value) {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue <= 0) {
        toast.error("Estimated delivery must be a positive number");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h3 className="text-xl font-bold text-center flex-grow text-gray-900">Send Proposal</h3>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {/* Proposal */}
          <div>
            <label className="block font-medium mb-2 text-gray-800">
              Your Proposal *{" "}
              <span className="text-sm text-gray-500">(min 10, max 10,000 characters)</span>
            </label>
            <div className="relative">
              <textarea
                rows={6}
                value={proposal}
                onChange={handleProposalChange}
                className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#2E90EB] focus:border-transparent ${
                  proposal.length > 10000 ? "border-red-500" : ""
                }`}
                placeholder="Describe your approach, relevant experience, and why you're a good fit..."
              />
              <div
                className={`text-xs mt-1 ${
                  proposal.length < 10
                    ? "text-red-500"
                    : proposal.length > 10000
                      ? "text-red-500"
                      : "text-gray-500"
                }`}
              >
                {proposal.length}/10,000 characters
              </div>
            </div>
          </div>

          {/* Bid Amount */}
          <div>
            <label className="block font-medium mb-2 text-gray-800">
              Bid Amount ($) *{" "}
              <span className="text-sm text-gray-500">(must be greater than 0)</span>
            </label>
            <input
              type="number"
              value={bidAmount}
              min={0.01}
              step="0.01"
              onChange={handleBidAmountChange}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E90EB] focus:border-transparent ${
                bidAmount !== "" && bidAmount <= 0 ? "border-red-500" : ""
              }`}
              placeholder="Enter your bid amount"
            />
          </div>

          {/* Estimated Delivery */}
          <div>
            <label className="block font-medium mb-2 text-gray-800">
              Estimated Delivery *{" "}
              <span className="text-sm text-gray-500">(must be greater than 0)</span>
            </label>
            <input
              type="number"
              value={estimatedDelivery}
              onChange={handleEstimatedDeliveryChange}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2E90EB] focus:border-transparent ${
                estimatedDelivery &&
                (isNaN(parseFloat(estimatedDelivery)) || parseFloat(estimatedDelivery) <= 0)
                  ? "border-red-500"
                  : ""
              }`}
              placeholder="Write only numeric value : for fixed: e.g., '10 days' | for hourly: e.g., '20 hours'"
            />
          </div>

          {/* Portfolio Links */}
          <div>
            <label className="block font-medium text-gray-800 mb-2">Portfolio Links</label>
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                placeholder="Link name"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <input
                type="url"
                placeholder="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <Button
                type="button"
                text="Add"
                onClick={handleAddLink}
                className="px-4 py-2 !w-auto flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Links List */}
            {links.length > 0 && (
              <ul className="space-y-2">
                {links.map((link, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2E90EB] hover:underline text-sm"
                    >
                      {link.name} — {link.url}
                    </a>
                    <button
                      onClick={() => handleDeleteLink(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block font-medium mb-2 text-gray-800">Attachments</label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
              onClick={() => document.getElementById("fileUpload")?.click()}
            >
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                accept="application/pdf"
                multiple
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Drag & drop Pdf files here or click to browse
                </p>
                <span className="mt-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                  Select Files
                </span>
              </div>
            </div>

            {files.length > 0 && (
              <ul className="mt-3 text-sm text-gray-600 space-y-1">
                {files.map((file, i) => (
                  <li key={i}>📄 {file.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3">
          <Button
            text="Cancel"
            onClick={onClose}
            className="!w-auto border bg-white text-gray-700 hover:bg-gray-50"
          />
          <Button
            text={loading ? "Sending..." : "Send Proposal"}
            onClick={handleSubmit}
            disabled={loading}
            className="!w-auto"
          />
        </div>
      </div>
    </div>
  );
}
