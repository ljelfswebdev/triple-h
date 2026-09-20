export default function GlassCard({
  as: Component = "div",
  children,
  className = "",
  ...props
}) {
  return (
    <Component className={`glass-card ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
