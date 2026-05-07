import MatchesContent from "./MatchesContent";

export default function MatchesPage() {
  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="space-y-6 rounded-3xl border border-red-100 bg-white p-8">
        <MatchesContent />
      </div>
    </div>
  );
}
