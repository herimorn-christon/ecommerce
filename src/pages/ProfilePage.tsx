import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { fetchUserProfile, logout } from '../redux/slices/authSlice';
import { fetchOrders } from '../redux/slices/ordersSlice';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { cancelOrder } from '../redux/slices/ordersSlice';
import { User, Clock, Package, LogOut, ShoppingCart, Heart, Settings } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading, error: userError } = useAppSelector(state => state.auth);
  const { orders, isLoading: isOrdersLoading } = useAppSelector(state => state.orders);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch user profile and orders on component mount
  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchOrders());
  }, [dispatch]);
  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      navigate('/');
    }
  };
  const handleCancel = (orderId: string) => {
    console.log('the cancelled order id is', orderId);
  const confirmed = window.confirm("Are you sure you want to cancel this order?");
  if (confirmed) {
    dispatch(cancelOrder(orderId));
  }
};

  
  // Get recent orders (last 3)
  const recentOrders = orders.slice(0, 3);

  // Filter and paginate orders for the orders tab
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  
  // Helper function to format currency
  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount === 'undefined') return 'N/A';
    return amount.toLocaleString();
  };
  
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 flex justify-center py-20">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }
  
  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {userError || 'User information not available. Please log in again.'}
          </div>
          <div className="mt-4">
            <Button 
              onClick={() => navigate('/login')}
              variant="primary"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-800 to-blue-600 text-white text-center">
                <div className="w-20 h-20 rounded-full bg-white text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <User size={40} />
                </div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-blue-100">{user.email}</p>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                        activeTab === 'profile' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <User size={18} className="mr-3" />
                      <span>Profile</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                        activeTab === 'orders' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Package size={18} className="mr-3" />
                      <span>Orders</span>
                    </button>
                  </li>
                  <li>
                    <Link
                      to="/wishlist"
                      className="w-full flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Heart size={18} className="mr-3" />
                      <span>Wishlist</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/cart"
                      className="w-full flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <ShoppingCart size={18} className="mr-3" />
                      <span>Cart</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
                        activeTab === 'settings' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Settings size={18} className="mr-3" />
                      <span>Settings</span>
                    </button>
                  </li>
                  <li className="border-t border-gray-200 pt-2 mt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} className="mr-3" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                    <p className="text-lg text-gray-800">{user.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Email Address</h3>
                    <p className="text-lg text-gray-800">{user.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                    <p className="text-lg text-gray-800">{user.phoneNumber}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Account Type</h3>
                    <p className="text-lg text-gray-800 capitalize">{user.roles?.join(', ') || 'User'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Member Since</h3>
                    <p className="text-lg text-gray-800">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button 
                    onClick={() => setActiveTab('settings')}
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                </div>
                
                {/* Recent Orders Section */}
                <div className="mt-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                  
                  {isOrdersLoading ? (
                    <div className="flex justify-center py-10">
                      <LoadingSpinner />
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <p className="text-gray-600">You haven't placed any orders yet.</p>
                  ) : (
                    <div className="space-y-4">
                    {recentOrders.map(order => (
  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center">
          <span className="font-medium text-gray-800">Order #{order.id.slice(-8)}</span>
          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1 flex items-center">
          <Clock size={14} className="mr-1" />
          {new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </div>

      <div className="text-right">
        <div className="font-bold text-blue-700">
          TZS {formatCurrency(order.totalAmount)}
        </div>
      {order.status === 'processing' && (
  <div className="d-flex justify-content-start mt-3">
    <Button 
      onClick={() => handleCancel(order.id)} 
      variant="outline-danger"
      className="px-3 py-2"
    >
      Cancel Order
    </Button>
  </div>
)}

      </div>
    </div>
  </div>
))}

                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Your Orders</h2>
                
                {/* Search and items per page controls at top */}
                <div className="flex justify-between items-center mb-6">
                  <input
                    type="text"
                    placeholder="Search order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <select
                    value={ordersPerPage}
                    onChange={(e) => {
                      setOrdersPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="5">5 per page</option>
                    <option value="20">20 per page</option>
                    <option value="25">25 per page</option>
                  </select>
                </div>

                {/* Orders list */}
                <div className="space-y-6">
                  {currentOrders.map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                        <div>
                          <div className="flex items-center">
                            <span className="font-bold text-gray-800 text-lg">Order #{order.id.slice(-8)}</span>
                            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1 flex items-center">
                            <Clock size={14} className="mr-1" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 text-lg font-bold text-blue-700">
                          TZS {formatCurrency(order.totalAmount)}
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Items:</span>
                          <span className="font-medium">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium capitalize">{order.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Delivery Option:</span>
                          <span className="font-medium capitalize">{order.deliveryOption || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </Link>
                        
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
 <Button 
  onClick={() => handleCancel(order.id)} 
  variant="outline-danger"
  className="px-3 py-2"
>
  Cancel Order
</Button>


                          )}
                        </div>
                      </div>
                  ))}
                </div>

                {/* Pagination controls at bottom */}
                {!isOrdersLoading && orders.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                      >
                        Previous
                      </Button>
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <Button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          variant={currentPage === index + 1 ? "primary" : "outline"}
                        >
                          {index + 1}
                        </Button>
                      ))}
                      
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={user.name}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={user.email}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={user.phoneNumber}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly
                          />
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 italic">
                        To update your personal information, please contact our customer support.
                      </p>
                    </form>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          id="emailNotifications"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="emailNotifications" className="ml-2 text-gray-700">
                          Receive email notifications about orders
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="smsNotifications"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="smsNotifications" className="ml-2 text-gray-700">
                          Receive SMS notifications about orders
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="marketingEmails"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="marketingEmails" className="ml-2 text-gray-700">
                          Receive marketing emails about promotions and new products
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h3>
                    <div className="space-y-4">
                      <Button 
                        onClick={handleLogout}
                        variant="outline"
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;