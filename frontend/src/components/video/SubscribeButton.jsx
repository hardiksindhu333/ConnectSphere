export default function SubscribeButton({ isSubscribed, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "px-4 py-2 rounded-full font-medium transition",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        isSubscribed
          ? "bg-white/10 hover:bg-white/15 border border-white/10 text-white"
          : "bg-white text-black hover:bg-gray-200",
      ].join(" ")}
    >
      {isSubscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
}

