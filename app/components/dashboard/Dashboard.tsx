import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Dashboard.css";
import DashboardLayout from "./DashboardLayout";

import axios from "axios";

// Define interfaces for our API data
interface CallLogObject {
  answer_time: string;
  bill_duration: number;
  billed_duration: number;
  call_direction: string;
  call_duration: number;
  call_id: string;
  call_uuid: string;
  end_time: string;
  from_country: string;
  from_number: string;
  hangup_cause_code: number;
  hangup_cause_name: string;
  hangup_source: string;
  initiation_time: string;
  to_country: string;
  to_number: string;
  total_amount: string;
  total_rate: string;
}

interface APIResponse {
  api_id: string;
  meta: {
    limit: number;
    offset: number;
    total_count: number;
    previous: string | null;
    next: string | null;
  };
  objects: CallLogObject[];
}

const Dashboard = () => {
  const [logs, setLogs] = useState<CallLogObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("03/05/2025 - 04/14/2025");
  const [groupedBy] = useState("Day");
  const [assistantFilter] = useState("All Assistants");

  // State
  const [callMinutesData, setCallMinutesData] = useState<
    { date: string; minutes: number }[]
  >([]);
  const [numberOfCallsData, setNumberOfCallsData] = useState<
    { date: string; calls: number }[]
  >([]);
  const [totalSpentData, setTotalSpentData] = useState<
    { date: string; amount: number }[]
  >([]);
  const [averageCostData, setAverageCostData] = useState<
    { date: string; cost: number }[]
  >([]);
  const [callEndReasonData, setCallEndReasonData] = useState<
    {
      name: string;
      "customer-ended-call": number;
      "silence-timed-out": number;
      "customer-did-not-answer": number;
    }[]
  >([]);
  const [concurrentCallsData, setConcurrentCallsData] = useState<
    { time: string; calls: number }[]
  >([]);
  const [unsuccessfulCalls, setUnsuccessfulCalls] = useState<
    {
      id: number;
      assistant: string;
      date: string;
      phone: string;
      status: string;
    }[]
  >([]);
  const [totalCallMinutes, setTotalCallMinutes] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [avgCostPerCall, setAvgCostPerCall] = useState(0);

  // Show dummy dashboard toast on component mount
  useEffect(() => {
    toast.info(
      "🚧 This is a dummy dashboard for demonstration purposes. The full-featured dashboard will look like this after production is completed!",
      {
        position: "top-center",
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        style: {
          background: "#2A282A",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderLeft: "4px solid #FF335F",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "500"
        }
      }
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:3001/api/calls");
        const apiData = response.data as APIResponse;
        console.log("Zentrunk Logs:", apiData);
        setLogs(apiData.objects);
        processApiData(apiData.objects);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Zentrunk logs:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const processApiData = (callLogs: CallLogObject[]) => {
    if (!callLogs || callLogs.length === 0) return;

    // Process total call minutes
    const totalMinutes = callLogs.reduce((sum, call) => {
      return sum + call.call_duration / 60; // Convert seconds to minutes
    }, 0);
    setTotalCallMinutes(parseFloat(totalMinutes.toFixed(2)));

    // Process total number of calls
    setTotalCalls(callLogs.length);

    // Process total spent
    const spent = callLogs.reduce((sum, call) => {
      return sum + parseFloat(call.total_amount);
    }, 0);
    setTotalSpent(parseFloat(spent.toFixed(2)));

    // Calculate average cost per call
    const avgCost = spent / callLogs.length;
    setAvgCostPerCall(parseFloat(avgCost.toFixed(2)));

    // Group calls by date for chart data
    const callsByDate = groupCallsByDate(callLogs);
    const dates = Object.keys(callsByDate).sort();

    // Prepare call minutes data by date
    const minutesData = dates.map((date) => {
      const minutesForDate = callsByDate[date].reduce((sum, call) => {
        return sum + call.call_duration / 60;
      }, 0);
      return {
        date,
        minutes: parseFloat(minutesForDate.toFixed(2)),
      };
    });
    setCallMinutesData(minutesData);

    // Prepare number of calls data by date
    const callsData = dates.map((date) => {
      return {
        date,
        calls: callsByDate[date].length,
      };
    });
    setNumberOfCallsData(callsData);

    // Prepare total spent data by date
    const spentData = dates.map((date) => {
      const amountForDate = callsByDate[date].reduce((sum, call) => {
        return sum + parseFloat(call.total_amount);
      }, 0);
      return {
        date,
        amount: parseFloat(amountForDate.toFixed(2)),
      };
    });
    setTotalSpentData(spentData);

    // Prepare average cost data by date
    const costData = dates.map((date) => {
      const callsForDate = callsByDate[date];
      const amountForDate = callsForDate.reduce((sum, call) => {
        return sum + parseFloat(call.total_amount);
      }, 0);
      const avgCostForDate =
        callsForDate.length > 0 ? amountForDate / callsForDate.length : 0;
      return {
        date,
        cost: parseFloat(avgCostForDate.toFixed(2)),
      };
    });
    setAverageCostData(costData);

    // Prepare call end reason data
    const endReasonData = prepareCallEndReasonData(callsByDate);
    setCallEndReasonData(endReasonData);

    // Prepare concurrent calls data
    const concurrentData = prepareConcurrentCallsData(callLogs);
    setConcurrentCallsData(concurrentData);

    // Prepare unsuccessful calls list
    const failedCalls = callLogs
      .filter((call) => call.hangup_cause_name !== "normal_hangup")
      .slice(0, 5)
      .map((call, index) => {
        const date = new Date(call.end_time);
        const formattedDate = `${date.getDate()} ${getMonthShort(
          date.getMonth()
        )}, ${formatTime(date)}`;
        return {
          id: index + 1,
          assistant: mapPhoneToAssistant(call.from_number),
          date: formattedDate,
          phone: call.to_number,
          status: "Failed",
        };
      });
    setUnsuccessfulCalls(failedCalls);
  };

  const groupCallsByDate = (calls: CallLogObject[]) => {
    return calls.reduce((groups, call) => {
      const date = call.end_time.split(" ")[0]; // Extract the date part
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(call);
      return groups;
    }, {} as Record<string, CallLogObject[]>);
  };

  const prepareCallEndReasonData = (
    callsByDate: Record<string, CallLogObject[]>
  ) => {
    const dates = Object.keys(callsByDate).sort();

    return dates.map((date) => {
      const callsForDate = callsByDate[date];
      const dateObj = new Date(date);
      const formattedDate = `${getMonthShort(
        dateObj.getMonth()
      )} ${dateObj.getDate()}`;

      const customerEnded = callsForDate.filter(
        (call) => call.hangup_source === "customer"
      ).length;
      const silenceTimeouts = callsForDate.filter(
        (call) => call.hangup_cause_name === "timeout"
      ).length;
      const noAnswer = callsForDate.filter(
        (call) => call.hangup_cause_name === "no_answer"
      ).length;

      return {
        name: formattedDate,
        "customer-ended-call": customerEnded,
        "silence-timed-out": silenceTimeouts,
        "customer-did-not-answer": noAnswer,
      };
    });
  };

  const prepareConcurrentCallsData = (calls: CallLogObject[]) => {
    // Group calls by hour to simplify
    const concurrentByHour: Record<string, number> = {};

    calls.forEach((call) => {
      const date = new Date(call.initiation_time);
      const hourKey = `${date.getFullYear()}-${padZero(
        date.getMonth() + 1
      )}-${padZero(date.getDate())} ${padZero(date.getHours())}:00`;

      if (!concurrentByHour[hourKey]) {
        concurrentByHour[hourKey] = 0;
      }
      concurrentByHour[hourKey]++;
    });

    return Object.entries(concurrentByHour)
      .map(([time, calls]) => ({
        time,
        calls,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  // Helper functions
  const getMonthShort = (month: number) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month];
  };

  const formatTime = (date: Date) => {
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    return `${hours}:${minutes}`;
  };

  const padZero = (num: number) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  const mapPhoneToAssistant = (phoneNumber: string) => {
    // Map phone numbers to assistant names (this is a placeholder - customize as needed)
    const phoneToAssistant: Record<string, string> = {
      "+918035737225": "Mary",
      "+918035737226": "Alex",
      "+918035737227": "Robin",
    };

    return phoneToAssistant[phoneNumber] || "Unknown Assistant";
  };

  // Sample data
  const callDurationData = [
    { name: "Mar 14", Mary: 0, Alex: 0, Robin: 0, "Unknown Assistant": 0 },
    { name: "Mar 16", Mary: 0, Alex: 0, Robin: 0, "Unknown Assistant": 0 },
    { name: "Mar 18", Mary: 0, Alex: 0, Robin: 0, "Unknown Assistant": 0 },
    { name: "Mar 20", Mary: 0, Alex: 0, Robin: 0, "Unknown Assistant": 0 },
    { name: "Mar 22", Mary: 0, Alex: 0, Robin: 0, "Unknown Assistant": 0 },
    { name: "Mar 24", Mary: 1.8, Alex: 0, Robin: 0, "Unknown Assistant": 0 },
    { name: "Mar 26", Mary: 0, Alex: 0.8, Robin: 0.6, "Unknown Assistant": 0 },
    { name: "Mar 28", Mary: 0.8, Alex: 0, Robin: 1.1, "Unknown Assistant": 0 },
    { name: "Mar 30", Mary: 0.8, Alex: 0, Robin: 0, "Unknown Assistant": 0 },
    { name: "Apr 01", Mary: 0, Alex: 0, Robin: 0, "Unknown Assistant": 0 },
  ];

  const costBreakdownData = [
    { name: "Mar 14", LLM: 0, STT: 0, TTS: 0, VAPI: 0 },
    { name: "Mar 16", LLM: 0, STT: 0, TTS: 0, VAPI: 0 },
    { name: "Mar 18", LLM: 0, STT: 0, TTS: 0, VAPI: 0 },
    { name: "Mar 20", LLM: 0, STT: 0, TTS: 0, VAPI: 0 },
    { name: "Mar 22", LLM: 0, STT: 0.2, TTS: 0, VAPI: 0 },
    { name: "Mar 24", LLM: 0, STT: 0, TTS: 0.3, VAPI: 0 },
    { name: "Mar 26", LLM: 0, STT: 0, TTS: 0.5, VAPI: 0 },
    { name: "Mar 28", LLM: 0, STT: 0, TTS: 0, VAPI: 0.3 },
    { name: "Mar 30", LLM: 0, STT: 0, TTS: 0, VAPI: 0.4 },
    { name: "Apr 01", LLM: 0, STT: 0, TTS: 0, VAPI: 0 },
  ];

  const successEvaluationData = [
    { name: "Mar 14", true: 0, unknown: 0, false: 0 },
    { name: "Mar 16", true: 0, unknown: 0, false: 0 },
    { name: "Mar 18", true: 0, unknown: 0, false: 0 },
    { name: "Mar 20", true: 0, unknown: 0, false: 0 },
    { name: "Mar 22", true: 1, unknown: 0, false: 0 },
    { name: "Mar 24", true: 0, unknown: 1, false: 1 },
    { name: "Mar 26", true: 0, unknown: 6, false: 3 },
    { name: "Mar 28", true: 0, unknown: 2, false: 0 },
    { name: "Mar 30", true: 0, unknown: 3, false: 3 },
    { name: "Apr 01", true: 0, unknown: 0, false: 0 },
  ];

  return (
    <DashboardLayout pageTitle="Overview">
      <header className="dashboard-header">
        <div className="title">
          <h2>Overview</h2>
        </div>
        <div className="filters">
          <div className="date-range">
            <span>📅 {dateRange}</span>
          </div>
          <div className="filter-options">
            <span>grouped by</span>
            <div className="dropdown">
              <span className="selected">{groupedBy}</span>
              <span className="arrow">▼</span>
            </div>
            <span>filtered by</span>
            <div className="dropdown">
              <span className="selected">{assistantFilter}</span>
              <span className="arrow">▼</span>
            </div>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="loading">Loading data...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>📞 Total Call Minutes</h3>
              <div className="stat-value">{totalCallMinutes.toFixed(2)}</div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={callMinutesData}>
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      stroke="#FF335F"
                      dot={false}
                    />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis hide={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="stat-card">
              <h3>📊 Number of Calls</h3>
              <div className="stat-value">{totalCalls}</div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={numberOfCallsData}>
                    <Line
                      type="monotone"
                      dataKey="calls"
                      stroke="#6366F1"
                      dot={false}
                    />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis hide={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="stat-card">
              <h3>💵 Total Spent</h3>
              <div className="stat-value">${totalSpent.toFixed(2)}</div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={totalSpentData}>
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#F97316"
                      dot={false}
                    />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis hide={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="stat-card">
              <h3>⚖️ Average Cost per Call</h3>
              <div className="stat-value">${avgCostPerCall.toFixed(2)}</div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={averageCostData}>
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#0EA5E9"
                      dot={false}
                    />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis hide={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="section-title">
            <h2>Call Analysis</h2>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>📋 Reason Call Ended</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={callEndReasonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="customer-ended-call"
                      stackId="a"
                      fill="#6366F1"
                    />
                    <Bar
                      dataKey="silence-timed-out"
                      stackId="a"
                      fill="#22C55E"
                    />
                    <Bar
                      dataKey="customer-did-not-answer"
                      stackId="a"
                      fill="#EAB308"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="legend">
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#6366F1" }}
                  ></div>
                  <span>customer-ended-call</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#22C55E" }}
                  ></div>
                  <span>silence-timed-out</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#EAB308" }}
                  ></div>
                  <span>customer-did-not-answer</span>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>⏱️ Average Call Duration by Assistant</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={callDurationData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Mary" fill="#6366F1" />
                    <Bar dataKey="Alex" fill="#22C55E" />
                    <Bar dataKey="Robin" fill="#EAB308" />
                    <Bar dataKey="Unknown Assistant" fill="#F97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="legend">
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#6366F1" }}
                  ></div>
                  <span>Mary</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#22C55E" }}
                  ></div>
                  <span>Alex</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#EAB308" }}
                  ></div>
                  <span>Robin</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#F97316" }}
                  ></div>
                  <span>Unknown Assistant</span>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>💰 Cost Breakdown</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="LLM" fill="#6366F1" />
                    <Bar dataKey="STT" fill="#22C55E" />
                    <Bar dataKey="TTS" fill="#EAB308" />
                    <Bar dataKey="VAPI" fill="#F97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="legend">
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#6366F1" }}
                  ></div>
                  <span>LLM</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#22C55E" }}
                  ></div>
                  <span>STT</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#EAB308" }}
                  ></div>
                  <span>TTS</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#F97316" }}
                  ></div>
                  <span>VAPI</span>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>✅ Success Evaluation</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={successEvaluationData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="true" stackId="a" fill="#22C55E" />
                    <Bar dataKey="unknown" stackId="a" fill="#6366F1" />
                    <Bar dataKey="false" stackId="a" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="legend">
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#22C55E" }}
                  ></div>
                  <span>true</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#6366F1" }}
                  ></div>
                  <span>Unknown</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#EF4444" }}
                  ></div>
                  <span>false</span>
                </div>
              </div>
            </div>

            <div className="chart-card unsuccessful-calls">
              <h3>❌ Unsuccessful calls</h3>
              <div className="calls-list">
                {unsuccessfulCalls.length > 0 ? (
                  unsuccessfulCalls.map((call) => (
                    <div className="call-item" key={call.id}>
                      <div className="call-details">
                        <div className="assistant-name">{call.assistant}</div>
                        <div className="call-info">
                          {call.date} • {call.phone}
                        </div>
                      </div>
                      <div className="call-status failed">{call.status}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-data">No unsuccessful calls found</div>
                )}
              </div>
              <div className="view-more">
                <button>View More</button>
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3>🔄 Number of Concurrent Calls</h3>
                <div className="dropdown">
                  <button className="dropdown-btn">Day</button>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={concurrentCallsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="calls"
                      stroke="#0EA5E9"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="ask-ai">
            <button className="ask-ai-btn">🤖 Ask AI</button>
          </div>
        </>
      )}
      <ToastContainer />
    </DashboardLayout>
  );
};

export default Dashboard;
