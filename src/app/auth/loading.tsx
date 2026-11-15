import { VoltaLoader } from "@/components/ui/VoltaLoader"

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <VoltaLoader size="md" caption="Securing session" />
    </div>
  )
}
