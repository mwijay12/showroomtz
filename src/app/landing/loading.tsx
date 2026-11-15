import { VoltaLoader } from "@/components/ui/VoltaLoader"

export default function LandingLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#050505]">
      <VoltaLoader size="lg" caption="Preparing campaign" />
    </div>
  )
}
