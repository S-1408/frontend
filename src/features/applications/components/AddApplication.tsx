const AddApplication = () => {
  return (
    <div className="w-full">
      <h2>Add Application</h2>
      <div>
        <div>
          <label>Company</label>
          <input />
        </div>
        <div>
          <label>Role</label>
          <input />
        </div>
        <div>
          <label>Status</label>
          <select className="rounded-lg bg-gray-200 px-3 py-2 ">
            <option value="All status">All status</option>
            <option value="interviewing">Interviewing</option>
            <option value="applied">Applied</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label>Applied Data</label>
          <input />
        </div>
      </div>
      <div>
        <button>Cancel</button>
        <button>Add</button>

      </div>
    </div>
  );
};

export default AddApplication;
