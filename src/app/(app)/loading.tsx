export default function AppLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy aria-live="polite">
      <div className="h-0.5 w-full overflow-hidden bg-orange-100">
        <div className="h-full w-1/3 animate-[pulse_0.8s_ease-in-out_infinite] bg-[#E85D04]" />
      </div>
    </div>
  );
}
