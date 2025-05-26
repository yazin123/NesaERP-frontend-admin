// src/components/ui/avatar-group.jsx
import { Avatar } from "@/components/ui/avatar";

export function AvatarGroup({ users = [], max = 3 }) {
  const displayedUsers = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {displayedUsers.map((user, idx) => (
        <Avatar key={idx}>
          <Avatar.Image src={user.image} />
          <Avatar.Fallback>{user.fallback}</Avatar.Fallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-medium">
          +{remaining}
        </div>
      )}
    </div>
  );
}
