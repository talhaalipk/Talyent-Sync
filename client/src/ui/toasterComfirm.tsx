import toast from "react-hot-toast";

export function confirmToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div className="bg-white shadow-md rounded-lg p-4 w-64">
          <p className="text-gray-800">{message}</p>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                resolve(true);
                toast.dismiss(t.id);
              }}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Yes
            </button>
            <button
              onClick={() => {
                resolve(false);
                toast.dismiss(t.id);
              }}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              No
            </button>
          </div>
        </div>
      ),
      { duration: 0 } // 👈 makes it stick until you dismiss, no auto delay
    );
  });
}
