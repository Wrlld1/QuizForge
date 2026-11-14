import * as LucideIcons from 'lucide-react'

interface UserAvatarProps {
  avatarImage?: string | null
  avatarIcon?: string
  avatarColor?: string
  size?: number
  className?: string
}

const SERVER_URL = 'http://localhost:5000'

export default function UserAvatar({
  avatarImage,
  avatarIcon = 'User',
  avatarColor = '#a855f7',
  size = 40,
  className = '',
}: UserAvatarProps) {
  if (avatarImage) {
    return (
      <img
        src={`${SERVER_URL}${avatarImage}`}
        alt="avatar"
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  const IconComponent = (LucideIcons as any)[avatarIcon] || LucideIcons.User

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: avatarColor + '30',
        color: avatarColor,
      }}
    >
      <IconComponent size={size * 0.5} />
    </div>
  )
}
