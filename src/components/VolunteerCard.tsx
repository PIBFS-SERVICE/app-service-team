import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { VolunteerWithSectors } from "@/types/database";
import { getMinistryTime, getInitials, getProficiencyIcon } from "@/lib/volunteer-utils";

interface VolunteerCardProps {
  volunteer: VolunteerWithSectors;
  index: number;
}

export function VolunteerCard({ volunteer, index }: VolunteerCardProps) {
  const navigate = useNavigate();

  const cardGradient = `linear-gradient(135deg,   
    #2856a7 0%,
    #0d66dc 25%,
    #6fa3ff 45%,
    #d6e4ff 50%,
    #6fa3ff 55%,
    #0d66dc 75%,
    #2856a7 100%
  )`;

  const accentColor = '#2563eb';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="cursor-pointer w-full"
      onClick={() => navigate(`/equipe/${volunteer.id}`)}
    >
      <div
        className="rounded-2xl p-3 shadow-xl relative card-shimmer bg-size-200 "
        style={{ background: cardGradient }}
      >
        {/* Image block */}
        <div className="rounded-xl overflow-hidden" style={{ height: '180px' }}>
          {volunteer.avatar_url ? (
            <img
              src={volunteer.avatar_url}
              alt={volunteer.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-4xl font-bold select-none">
              {getInitials(volunteer.name)}
            </div>
          )}
        </div>

        {/* Info block */}
        <div
          className="rounded-xl mt-2.5 px-4 py-3 bg-neutral-100 bg-opacity-90 backdrop-blur-sm"
        >
          {/* Nickname */}
          <h3
            className="text-xl font-bold text-gray-800 "

          >
            {volunteer.nickname || volunteer.name}
          </h3>
        {/* Name */}
          <h3
            className="text-xs font-medium  text-gray-400 pb-2 mb-3 truncate"
            style={{ borderBottom: `3px solid ${accentColor}` }}
          >
            {volunteer.name || ""}
          </h3>

          {/* Area de atuação */}
          <div className="mb-4 mt-8">
            <span className="text-sm text-gray-400 mb-1 block">Area de atuação:</span>
            <div
              className="flex items-center justify-between rounded-full px-1 gap-2"
              style={{ background: '#f3f3f3', height: '48px' }}
            >
              <span className="text-sm text-gray-400 flex-shrink-0">
                {volunteer.volunteer_sectors.filter(vs => vs.is_active_in_sector).length === 0 ? 'N/A' : ''}
              </span>
              <div className="flex gap-1 items-center">
                {volunteer.volunteer_sectors.filter(vs => vs.is_active_in_sector).map((vs) => {
                  const iconUrl = vs.sectors.url_icon;
                  return iconUrl ? (
                    <motion.img
                      key={vs.id}
                      src={iconUrl}
                      alt={vs.sectors.name}
                      className="w-11 h-11 object-contain"
                      title={`${vs.sectors.name} (${vs.proficiency_status})`}
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.15 }}
                    />
                  ) : (
                    <div
                      key={vs.id}
                      className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: accentColor }}
                      title={`${vs.sectors.name} (${vs.proficiency_status})`}
                    >
                      {vs.sectors.name.charAt(0)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-3">
            <span className="text-sm text-gray-400 mb-1 block">Skills:</span>
            <div
              className="flex items-center justify-between rounded-full px-1 gap-2"
              style={{ background: '#1a51c7', height: '48px' }}
            >
              <span className="text-sm text-gray-400 flex-shrink-0">
                {volunteer.volunteer_sectors.length === 0 ? 'Nenhuma' : ''}
              </span>
              <div className="flex gap-1 items-center">
                {volunteer.volunteer_sectors.map((vs) => {
                  const iconUrl = getProficiencyIcon(vs);
                  return iconUrl ? (
                    <motion.img
                      key={vs.id}
                      src={iconUrl}
                      alt={vs.sectors.name}
                      className="w-11 h-11 object-contain"
                      title={`${vs.sectors.name} (${vs.proficiency_status})`}
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.15 }}
                    />
                  ) : (
                    <div
                      key={vs.id}
                      className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: accentColor }}
                      title={`${vs.sectors.name} (${vs.proficiency_status})`}
                    >
                      {vs.sectors.name.charAt(0)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
