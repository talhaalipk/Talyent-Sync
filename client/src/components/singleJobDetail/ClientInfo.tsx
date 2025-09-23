// src/components/singleJobDetail/ClientInfo.tsx
import { MapPin, Star, User } from "lucide-react";
import { useJobStore } from "../../store/singleJobstore";

export default function ClientInfo() {
  const { client } = useJobStore();
  console.log("client : ", client);

  if (!client) return null;

  return (
    <section className="bg-[#F9FAFB] rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">About the Client</h2>
      <div className="flex items-center gap-4 mb-4">
        <img
          src={client.profilePic}
          alt={client.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h3 className="font-bold">{client.UserName}</h3>
          <p className="text-sm">{client.clientProfile?.companyName}</p>
        </div>
      </div>
      <div className="space-y-3">
        {client.clientProfile?.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{client.clientProfile.location}</span>
          </div>
        )}
        {client.clientProfile?.clientRating && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm">{client.clientProfile.clientRating}/5 rating</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm">Username: {client.UserName}</span>
        </div>
      </div>
    </section>
  );
}
