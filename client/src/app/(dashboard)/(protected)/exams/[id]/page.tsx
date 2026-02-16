import ExamTakingClient from "@/components/exam/ExamTakingClient";

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExamTakingClient examId={id} />;
}
