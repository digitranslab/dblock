import Loading from "@/components/ui/loading";

export default function LoadingOverlay() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background align-middle">
      <Loading />
    </div>
  );
}
