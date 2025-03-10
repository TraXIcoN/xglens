export default function TriangleGraphic() {
  return (
    <div className="relative w-full flex justify-center py-8">
      <div className="w-0 h-0 border-l-[150px] border-l-transparent border-b-[260px] border-b-black border-r-[150px] border-r-transparent">
        {/* Indicator dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-blue-400"></div>
          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
