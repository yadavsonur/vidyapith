import VerifyCertificateForm from "./_components/verify-certificate-form";

export default function VerifyPage() {
  return <main className="min-h-screen bg-parchment-50 p-6 md:p-12 flex items-center justify-center"><div className="w-full max-w-2xl space-y-6"><div className="text-center"><div className="text-[10px] font-mono uppercase tracking-[0.25em] text-ochre-700">Credential Verification</div><h1 className="font-serif text-4xl md:text-5xl text-ink-950 mt-2">Verify a Certificate</h1><p className="text-sm text-ink-600 mt-2">Enter a Vidhyapith certificate number to verify its current status.</p></div><VerifyCertificateForm /></div></main>;
}
