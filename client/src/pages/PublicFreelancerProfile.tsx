import { useEffect } from "react";
import { usePublicFreelancerStore } from "../store/usePublicFreelancerStore";

// Import all the component sections
import FreelancerHeader from "../components/freelancer/FreelancerHeader";
import AboutSection from "../components/freelancer/AboutSection";
import SkillsSection from "../components/freelancer/SkillsSection";
import PortfolioSection from "../components/freelancer/PortfolioSection";
import ReviewsSection from "../components/freelancer/ReviewsSection";
import QuickStats from "../components/freelancer/QuickStats";
import Certifications from "../components/freelancer/Certifications";
import RecentWork from "../components/freelancer/RecentWork";
import ContactCTA from "../components/freelancer/ContactCTA";

const PublicFreelancerProfile = () => {
  // Get ID from URL or pass as prop
  const id = window.location.pathname.split("/").pop() || "";
  const { freelancer, loading, error, fetchFreelancerProfile, reset } = usePublicFreelancerStore();

  useEffect(() => {
    if (id) {
      fetchFreelancerProfile(id);
    }
    return () => reset();
  }, [id, fetchFreelancerProfile, reset]);

  const handleContactFreelancer = () => {
    // Implement your contact logic here
    // For example: navigate to chat, open contact modal, etc.
    console.log("Contact freelancer:", freelancer?.name);
    alert(`Contact functionality for ${freelancer?.name} to be implemented`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E90EB] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading freelancer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Freelancer Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || "The requested freelancer profile could not be found."}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#2E90EB] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <FreelancerHeader freelancer={freelancer} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <AboutSection bio={freelancer.bio} />
            <SkillsSection skills={freelancer.skills} />
            <PortfolioSection portfolio={freelancer.portfolio} />
            <ReviewsSection reviews={freelancer.reviews} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <QuickStats
              totalEarnings={freelancer.totalEarnings}
              contractStats={freelancer.contractStats}
              successRate={freelancer.successRate}
            />
            <Certifications certifications={freelancer.certifications} />
            <RecentWork recentContracts={freelancer.recentContracts} />
            <ContactCTA freelancerName={freelancer.name} onContactClick={handleContactFreelancer} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicFreelancerProfile;

// import  { useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { usePublicFreelancerStore } from '../store/usePublicFreelancerStore';
// import { Star, MapPin, Clock, Award, DollarSign, Calendar, ExternalLink, CheckCircle } from 'lucide-react';

// const PublicFreelancerProfile = () => {
//   // Get freelancer ID from props or URL
// //   const id = freelancerId || window.location.pathname.split('/').pop() || '';
//   const { id } = useParams()
//   const { freelancer, loading, error, fetchFreelancerProfile, reset } = usePublicFreelancerStore();

//   useEffect(() => {
//     if (id) {
//       fetchFreelancerProfile(id);
//     }
//     return () => reset();
//   }, [id, fetchFreelancerProfile, reset]);

//   const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
//     const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
//     return (
//       <div className="flex items-center">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <Star
//             key={star}
//             className={`${sizeClass} ${
//               star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
//             }`}
//           />
//         ))}
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E90EB] mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading freelancer profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !freelancer) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center max-w-md mx-auto p-6">
//           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-red-600 text-2xl">!</span>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Freelancer Not Found</h2>
//           <p className="text-gray-600 mb-4">{error || 'The requested freelancer profile could not be found.'}</p>
//           <button
//             onClick={() => window.history.back()}
//             className="px-4 py-2 bg-[#2E90EB] text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header Section */}
//       <div className=" ">
//         <div className="max-w-6xl mx-auto px-4 py-8">
//           <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
//             <div className="relative">
//               <img
//                 src={freelancer.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.name)}&background=134848&color=fff&size=200`}
//                 alt={freelancer.name}
//                 className="w-24 h-24 rounded-full object-cover shadow-lg ring-4 ring-white"
//               />
//               <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
//             </div>

//             <div className="flex-1 min-w-0">
//               <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
//                 <div className="min-w-0 flex-1">
//                   <h1 className="text-3xl font-bold text-gray-900 truncate">{freelancer.name}</h1>
//                   <p className="text-lg text-gray-600 mb-2">@{freelancer.username}</p>

//                   <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
//                     {freelancer.location && (
//                       <div className="flex items-center gap-1">
//                         <MapPin className="w-4 h-4" />
//                         <span>{freelancer.location}</span>
//                       </div>
//                     )}

//                     <div className="flex items-center gap-1">
//                       <Calendar className="w-4 h-4" />
//                       <span>Member since {new Date(freelancer.memberSince).getFullYear()}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="text-right sm:text-left">
//                   <div className="flex items-center gap-2 sm:justify-end mb-2">
//                     {renderStars(freelancer.ratingAvg, 'md')}
//                     <span className="font-semibold text-lg">{freelancer.ratingAvg.toFixed(1)}</span>
//                     <span className="text-gray-600">({freelancer.ratingCount})</span>
//                   </div>
//                   <p className="text-3xl font-bold text-[#134848]">
//                     ${freelancer.hourlyRate}<span className="text-lg font-normal text-gray-600">/hr</span>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Man Content */}
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Main Content */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* About Section */}
//             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//               <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
//               <p className="text-gray-700 leading-relaxed">
//                 {freelancer.bio || 'This freelancer prefers to let their work speak for itself.'}
//               </p>
//             </div>

//             {/* Skills Section */}
//             {freelancer.skills.length > 0 && (
//               <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills & Expertise</h2>
//                 <div className="flex flex-wrap gap-2">
//                   {freelancer.skills.map((skill, index) => (
//                     <span
//                       key={index}
//                       className="px-4 py-2 bg-gradient-to-r from-[#134848] to-[#1a5a5a] text-white rounded-full text-sm font-medium hover:shadow-md transition-shadow"
//                     >
//                       {skill}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Portfolio Section */}
//             {freelancer.portfolio.length > 0 && (
//               <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {freelancer.portfolio.map((item, index) => (
//                     <div key={index} className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-[#2E90EB]">
//                       <div className="flex items-start justify-between mb-3">
//                         <h3 className="font-semibold text-gray-900 group-hover:text-[#2E90EB] transition-colors">
//                           {item.title}
//                         </h3>
//                         {item.url && (
//                           <a
//                             href={item.url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-[#2E90EB] hover:text-blue-700 transition-colors"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <ExternalLink className="w-4 h-4" />
//                           </a>
//                         )}
//                       </div>
//                       {item.description && (
//                         <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Reviews Section */}
//             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Reviews</h2>
//               <div className="space-y-6">
//                 {freelancer.reviews.length > 0 ? (
//                   freelancer.reviews.map((review) => (
//                     <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
//                       <div className="flex items-start gap-4">
//                         <img
//                           src={review.client.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.client.name)}&background=134848&color=fff&size=50`}
//                           alt={review.client.name}
//                           className="w-12 h-12 rounded-full object-cover"
//                         />
//                         <div className="flex-1">
//                           <div className="flex items-center gap-3 mb-2">
//                             <span className="font-semibold text-gray-900">{review.client.name}</span>
//                             {renderStars(review.rating)}
//                             <span className="text-sm text-gray-500">
//                               {new Date(review.createdAt).toLocaleDateString()}
//                             </span>
//                           </div>
//                           <p className="text-sm text-[#2E90EB] font-medium mb-2">
//                             Project: {review.jobTitle}
//                           </p>
//                           <p className="text-gray-700 leading-relaxed">{review.comment}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-center py-8">
//                     <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                     <p className="text-gray-600">No reviews yet. Be the first to work with this freelancer!</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Sidebar */}
//           <div className="space-y-6">
//             {/* Quick Stats */}
//             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//               <h3 className="font-bold text-gray-900 mb-6">Quick Stats</h3>
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                       <DollarSign className="w-4 h-4 text-green-600" />
//                     </div>
//                     <span className="text-gray-700 font-medium">Total Earned</span>
//                   </div>
//                   <span className="font-bold text-green-700">${freelancer.totalEarnings.toLocaleString()}</span>
//                 </div>

//                 <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                       <CheckCircle className="w-4 h-4 text-blue-600" />
//                     </div>
//                     <span className="text-gray-700 font-medium">Jobs Completed</span>
//                   </div>
//                   <span className="font-bold text-blue-700">{freelancer.contractStats.completedContracts}</span>
//                 </div>

//                 <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
//                       <Clock className="w-4 h-4 text-purple-600" />
//                     </div>
//                     <span className="text-gray-700 font-medium">Active Projects</span>
//                   </div>
//                   <span className="font-bold text-purple-700">{freelancer.contractStats.activeContracts}</span>
//                 </div>

//                 <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
//                       <Award className="w-4 h-4 text-orange-600" />
//                     </div>
//                     <span className="text-gray-700 font-medium">Success Rate</span>
//                   </div>
//                   <span className="font-bold text-orange-700">{freelancer.successRate}%</span>
//                 </div>
//               </div>
//             </div>

//             {/* Certifications */}
//             {freelancer.certifications.length > 0 && (
//               <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//                 <h3 className="font-bold text-gray-900 mb-4">Certifications</h3>
//                 <div className="space-y-3">
//                   {freelancer.certifications.map((cert, index) => (
//                     <div key={index} className="border-l-4 border-[#2E90EB] pl-4 py-2">
//                       <h4 className="font-medium text-gray-900">{cert.title}</h4>
//                       <p className="text-sm text-gray-600">{cert.issuer}</p>
//                       {cert.year && (
//                         <p className="text-xs text-gray-500 mt-1">{cert.year}</p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Recent Work */}
//             {freelancer.recentContracts.length > 0 && (
//               <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//                 <h3 className="font-bold text-gray-900 mb-4">Recent Work</h3>
//                 <div className="space-y-4">
//                   {freelancer.recentContracts.slice(0, 5).map((contract, index) => (
//                     <div key={index} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
//                       <h4 className="font-medium text-sm text-gray-900 mb-1">{contract.jobTitle}</h4>
//                       <p className="text-xs text-gray-600 mb-1">Client: {contract.clientName}</p>
//                       <div className="flex justify-between items-center">
//                         <span className="text-xs text-gray-500">
//                           {new Date(contract.completedAt).toLocaleDateString()}
//                         </span>
//                         <span className="text-xs font-medium text-[#134848]">
//                           {contract.type === 'fixed' ? 'Fixed Price' : 'Hourly'}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Contact CTA */}
//             <div className="bg-gradient-to-br from-[#134848] to-[#2E90EB] rounded-xl shadow-lg p-6 text-white">
//               <h3 className="font-bold text-lg mb-2">Ready to work together?</h3>
//               <p className="text-sm opacity-90 mb-4">
//                 Get in touch to discuss your project requirements.
//               </p>
//               <button
//                 className="w-full bg-white text-[#134848] font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
//                 onClick={() => {
//                   // Add your contact/hire logic here
//                   alert('Contact functionality to be implemented based on your authentication system');
//                 }}
//               >
//                 Contact Freelancer
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PublicFreelancerProfile;
