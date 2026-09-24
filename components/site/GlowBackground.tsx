export default function GlowBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-radial-glow">
      <div
        className="absolute -top-[12%] left-1/2 h-[46vw] w-[46vw] -translate-x-1/2 rounded-full opacity-30 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(230, 193, 92, 0.55) 0%, rgba(230, 193, 92, 0) 70%)",
        }}
      />
      <div
        className="absolute -bottom-[10%] left-[8%] h-[38vw] w-[38vw] rounded-full opacity-25 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(242, 168, 63, 0.4) 0%, rgba(242, 168, 63, 0) 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
