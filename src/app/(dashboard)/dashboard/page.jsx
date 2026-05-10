import DashBoard from '@/pages/DashBoard'
import PrivateRoute from '@/components/PrivateRoute'

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <DashBoard />
    </PrivateRoute>
  )
}