import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import clsx from 'clsx';

const taskData = [
  { name: 'Mon', completed: 4, ongoing: 6 },
  { name: 'Tue', completed: 7, ongoing: 8 },
  { name: 'Wed', completed: 5, ongoing: 9 },
  { name: 'Thu', completed: 10, ongoing: 4 },
  { name: 'Fri', completed: 12, ongoing: 3 },
  { name: 'Sat', completed: 6, ongoing: 2 },
  { name: 'Sun', completed: 8, ongoing: 1 },
];

const velocityData = [
  { month: 'Jan', velocity: 45 },
  { month: 'Feb', velocity: 52 },
  { month: 'Mar', velocity: 48 },
  { month: 'Apr', velocity: 70 },
  { month: 'May', velocity: 85 },
  { month: 'Jun', velocity: 92 },
];

const priorityData = [
  { name: 'Urgent', value: 15, color: '#A855F7' },
  { name: 'High', value: 30, color: '#EF4444' },
  { name: 'Medium', value: 45, color: '#3B82F6' },
  { name: 'Low', value: 10, color: '#10B981' },
];

export default function Reports() {
  const [timeRange, setTimeRange] = useState('This Week');

  const stats = [
    { label: 'Total Tasks', value: '124', change: '+12%', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Completion Rate', value: '88%', change: '+5.4%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10' },
    { label: 'Avg. Velocity', value: '42.5', change: '-2.1%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { label: 'Billable Hours', value: '164h', change: '+18%', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Analytics & Reports</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Track productivity, velocity, and team performance</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-[hsl(var(--muted))]/10 border border-[hsl(var(--border))] rounded-xl">
          {['This Week', 'This Month', 'All Time'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={clsx(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                timeRange === range 
                  ? "bg-[hsl(var(--primary))] text-white shadow-md" 
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={clsx("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={clsx("w-6 h-6", stat.color)} />
              </div>
              <div className={clsx(
                "flex items-center gap-1 text-xs font-bold",
                stat.change.startsWith('+') ? "text-green-500" : "text-red-500"
              )}>
                {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Activity Chart */}
        <div className="lg:col-span-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold">Task Activity</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Overview of completed vs ongoing tasks</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))]" />
                 <span className="text-xs font-medium">Completed</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-[hsl(var(--muted))]" />
                 <span className="text-xs font-medium">Ongoing</span>
               </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="ongoing" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Priority Load</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">Task distribution by urgency</p>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold">124</span>
              <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-widest">Tasks</span>
            </div>
          </div>
          <div className="space-y-4 mt-8">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Velocity Chart */}
        <div className="lg:col-span-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold">Team Velocity</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Overall efficiency trend over the last 6 months</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-xl font-bold text-xs hover:bg-[hsl(var(--secondary))]/80 transition-all">
              <Target className="w-4 h-4" />
              Set Goal
            </button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="velocity" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVelocity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
