// src/components/Admin/DisputeManagement.tsx
import { useEffect } from "react";
import { AlertTriangle, DollarSign, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDisputeStore } from "../../store/Admin/disputeStore";
import DisputeCard from "./Dispute/DisputeCard";

const DisputeManagement = () => {
  const navigate = useNavigate();
  const { disputes, disputesLoading, fetchDisputes } = useDisputeStore();

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewDetails = (contractId: string) => {
    navigate(`/admin/dashboard/dispute-management/${contractId}`);
  };

  // Calculate statistics
  const totalAmount = disputes.reduce((sum, dispute) => sum + dispute.totalAmount, 0);
  const fixedContracts = disputes.filter((d) => d.type === "fixed").length;
  const hourlyContracts = disputes.filter((d) => d.type === "hourly").length;

  if (disputesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#134848] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading disputed contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#F59E0B] bg-opacity-10 rounded-lg flex items-center justify-center">
            <AlertTriangle className="text-[#F59E0B]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#134848]">Dispute Management</h1>
            <p className="text-gray-600">
              Resolve contract disputes between clients and freelancers
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Disputes</p>
              <p className="text-3xl font-bold text-[#F59E0B]">{disputes.length}</p>
            </div>
            <AlertTriangle className="text-[#F59E0B]" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
            </div>
            <DollarSign className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Fixed Contracts</p>
              <p className="text-3xl font-bold text-blue-600">{fixedContracts}</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Hourly Contracts</p>
              <p className="text-3xl font-bold text-purple-600">{hourlyContracts}</p>
            </div>
            <Clock className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#134848]">Active Disputes</h2>
          <p className="text-sm text-gray-600">Contracts requiring administrative resolution</p>
        </div>

        <div className="p-6">
          {disputes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Disputes Found</h3>
              <p className="text-gray-600">
                All contracts are running smoothly! There are no disputes requiring your attention
                at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {disputes.map((dispute) => (
                <DisputeCard
                  key={dispute._id}
                  dispute={dispute}
                  onViewDetails={() => handleViewDetails(dispute._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputeManagement;
