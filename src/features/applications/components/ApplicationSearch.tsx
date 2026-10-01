type ApplicationSearchProps = {
    searchTerm:string;
    setSearchTerm:(searchTerm:string)=>void
}
const ApplicationSearch = ({searchTerm,setSearchTerm}:ApplicationSearchProps) => {
  return (
    <input
    type="text"
    value={searchTerm}
    onChange={(e)=>setSearchTerm(e.target.value)}
     className="w-full border border-gray-300 rounded-lg px-3 py-2 transition hover:border-gray-900 focus:border-gray-900"
     placeholder="Search Company or Role.."
    />

  )
}

export default ApplicationSearch