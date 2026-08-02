interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  const first = parts[0]?.[0] || '';
  const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + second).toUpperCase();
};

const Avatar = ({ name, avatarUrl, size = 96 }: AvatarProps) => {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="rounded-full object-cover border border-canvas-line"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-ink text-paper flex items-center justify-center font-display font-bold border border-canvas-line"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;