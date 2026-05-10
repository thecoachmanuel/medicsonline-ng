import { AiFillGoogleCircle } from "react-icons/ai"

export default function OAuth() {
  return (
    <button
      type="button"
      disabled
      className="w-full flex justify-center items-center py-2 px-4 rounded-sm bg-gray-200 text-gray-600 text-sm font-semibold cursor-not-allowed"
    >
      <AiFillGoogleCircle className="w-6 h-6 mr-2" />
      <span className="text-center">Continue with Google</span>
    </button>
  )
}
