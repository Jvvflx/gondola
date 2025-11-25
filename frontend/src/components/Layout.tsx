import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Package, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-primary-700 via-primary-800 to-accent-900 transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="relative h-full flex flex-col p-6">
                    {/* Logo Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-3 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">Gôndola.AI</h1>
                                    <p className="text-xs text-white/60">Gestão Inteligente</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                {sidebarOpen ? (
                                    <X className="w-5 h-5 text-white" />
                                ) : (
                                    <Menu className="w-5 h-5 text-white" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2 flex-1">
                        <NavLink
                            to="/dashboard"
                            icon={<LayoutDashboard className="w-5 h-5" />}
                            label="Dashboard"
                            active={isActive('/dashboard')}
                            collapsed={!sidebarOpen}
                        />
                        <NavLink
                            to="/promotions"
                            icon={<Sparkles className="w-5 h-5" />}
                            label="Promoções IA"
                            active={isActive('/promotions')}
                            collapsed={!sidebarOpen}
                        />
                        <NavLink
                            to="/products"
                            icon={<Package className="w-5 h-5" />}
                            label="Produtos"
                            active={isActive('/products')}
                            collapsed={!sidebarOpen}
                        />
                    </nav>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-xl transition-all duration-300 group ${!sidebarOpen && 'justify-center'}`}
                    >
                        <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                        {sidebarOpen && <span className="font-medium">Sair</span>}
                    </button>
                </div>

                {/* Decorative Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
                <Outlet />
            </main>
        </div>
    );
}

function NavLink({ to, icon, label, active, collapsed }: any) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${active
                    ? 'bg-white/20 text-white font-semibold shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                } ${collapsed && 'justify-center'}`}
        >
            {/* Active Indicator */}
            {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
            )}

            <div className={`${active && 'scale-110'} transition-transform duration-300`}>
                {icon}
            </div>

            {!collapsed && (
                <span className="font-medium">{label}</span>
            )}

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        </Link>
    );
}

