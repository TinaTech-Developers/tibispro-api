"use client";

import { useEffect, useState } from "react";

import {
  Building2,
  Users,
  Package,
  FileText,
  Crown,
  Rocket,
  DollarSign,
  Activity,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { motion } from "framer-motion";

type AnalyticsData = {
  stats: {
    totalOrganizations: number;
    activeOrganizations: number;
    totalUsers: number;
    totalCustomers: number;
    totalProducts: number;
    totalInvoices: number;

    paidPlans: number;
    trialPlans: number;

    subscriptionRevenue: number;
  };

  planChart: {
    name: string;
    value: number;
  }[];

  organizationGrowth: {
    month: string;
    organizations: number;
  }[];

  userGrowth: {
    month: string;
    users: number;
  }[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/admin/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="p-10">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="p-10">Unable to load analytics</div>;
  }

  const cards = [
    {
      title: "Total Organizations",
      value: data.stats.totalOrganizations,
      icon: Building2,
    },

    {
      title: "Active Organizations",
      value: data.stats.activeOrganizations,
      icon: Activity,
    },

    {
      title: "Total Users",
      value: data.stats.totalUsers,
      icon: Users,
    },

    {
      title: "PRO Subscribers",
      value: data.stats.paidPlans,
      icon: Crown,
    },

    {
      title: "Trial Accounts",
      value: data.stats.trialPlans,
      icon: Rocket,
    },

    {
      title: "Subscription Revenue",
      value: `$${data.stats.subscriptionRevenue}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}

      <div>
        <h1
          className="
text-xl
font-bold text-slate-800
"
        >
          TibizPro Analytics
        </h1>

        <p
          className="
text-gray-500
"
        >
          Monitor application growth and platform performance
        </p>
      </div>

      {/* STAT CARDS */}

      <div
        className="
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-3
gap-6
"
      >
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.1,
              }}
              className="
bg-white
rounded-2xl
shadow-sm
border
p-6
flex
justify-between
items-center
"
            >
              <div>
                <p
                  className="
text-gray-500
text-sm
"
                >
                  {card.title}
                </p>

                <h2
                  className="
text-3xl
font-bold
mt-2 text-slate-700
"
                >
                  {card.value}
                </h2>
              </div>

              <div
                className="
bg-blue-100
p-4
rounded-xl
"
              >
                <Icon
                  className="
text-blue-600
"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CHART SECTION */}

      <div
        className="
grid
lg:grid-cols-2
gap-8
"
      >
        {/* ORGANIZATION GROWTH */}

        <div
          className="
bg-white
rounded-2xl
shadow-sm
border
p-6
"
        >
          <h2
            className="
font-semibold
text-xl
mb-5 text-slate-700
"
          >
            Organization Growth
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.organizationGrowth}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Line type="monotone" dataKey="organizations" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PLAN DISTRIBUTION */}

        <div
          className="
bg-white
rounded-2xl
shadow-sm
border
p-6
"
        >
          <h2
            className="
font-semibold
text-xl
mb-5 text-slate-700
"
          >
            Subscription Plans
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.planChart}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {data.planChart.map((item, index) => (
                  <Cell key={index} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* USER GROWTH */}

      <div
        className="
bg-white
rounded-2xl
shadow-sm
border
p-6
"
      >
        <h2
          className="
font-semibold
text-xl
mb-5 text-slate-700
"
        >
          User Adoption Growth
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line type="monotone" dataKey="users" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PLATFORM USAGE */}

      <div
        className="
grid
md:grid-cols-3
gap-6
"
      >
        <div
          className="
bg-white
border
rounded-2xl
p-6 
"
        >
          <p className="bg-blue-900 w-10 h-10 flex items-center justify-center rounded-full">
            <Users />
          </p>

          <p
            className="
text-gray-500
mt-3
"
          >
            Customers Managed
          </p>

          <h2
            className="
text-2xl
font-bold
"
          >
            {data.stats.totalCustomers}
          </h2>
        </div>

        <div
          className="
bg-white
border
rounded-2xl
p-6
"
        >
          {" "}
          <p className="bg-blue-900 w-10 h-10 flex items-center justify-center rounded-full">
            <Package />
          </p>
          <p
            className="
text-gray-500
mt-3
"
          >
            Products Created
          </p>
          <h2
            className="
text-2xl
font-bold
"
          >
            {data.stats.totalProducts}
          </h2>
        </div>

        <div
          className="
bg-white
border
rounded-2xl
p-6
"
        >
          <p className="bg-blue-900 w-10 h-10 flex items-center justify-center rounded-full">
            <FileText />
          </p>
          <p
            className="
text-gray-500
mt-3
"
          >
            Invoices Generated
          </p>

          <h2
            className="
text-2xl
font-bold
"
          >
            {data.stats.totalInvoices}
          </h2>
        </div>
      </div>
    </div>
  );
}
