export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
            <div className="p-2 bg-blue-50 text-primary-500 rounded-full">
              <i className="fa-solid fa-user-group" />
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">248</p>
            <p className="ml-2 text-sm text-green-600 flex items-center">
              <i className="fa-solid fa-arrow-up mr-1" /> 12%
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">Compared to last month</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Today's Appointments</h3>
            <div className="p-2 bg-green-50 text-green-500 rounded-full">
              <i className="fa-solid fa-calendar-check" />
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">36</p>
            <p className="ml-2 text-sm text-green-600 flex items-center">
              <i className="fa-solid fa-arrow-up mr-1" /> 8%
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">4 pending confirmations</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Available Machines</h3>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-full">
              <i className="fa-solid fa-pump-medical" />
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">18/24</p>
            <p className="ml-2 text-sm text-yellow-600 flex items-center">
              <i className="fa-solid fa-arrow-down mr-1" /> 3
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">6 currently in use</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Critical Alerts</h3>
            <div className="p-2 bg-red-50 text-red-500 rounded-full">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="ml-2 text-sm text-red-600 flex items-center">
              <i className="fa-solid fa-arrow-up mr-1" /> 2
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">Requires immediate attention</p>
        </div>
      </div>

      {/* Conteúdo principal (lista + estatísticas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de agendamentos (exemplo estático) */}
        <div className="lg:col-span-2 card p-0">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Today's Appointments</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors duration-200">
                <i className="fa-solid fa-filter mr-1" /> Filter
              </button>
              <button className="px-3 py-1 text-sm text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors duration-200">
                <i className="fa-solid fa-plus mr-1" /> Add New
              </button>
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {['Patient','Time','Type','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { name:'Sarah Johnson', id:'PT-2458', time:'09:00', dur:'30 min', type:'Hemodialysis', st:'In Progress', stc:'bg-green-50 text-green-700', avatar:1 },
                  { name:'Robert Chen', id:'PT-1875', time:'10:15', dur:'45 min', type:'Peritoneal', st:'Waiting', stc:'bg-yellow-50 text-yellow-700', avatar:3 },
                  { name:'Maria Garcia', id:'PT-3142', time:'11:30', dur:'30 min', type:'Hemodialysis', st:'Scheduled', stc:'bg-gray-50 text-gray-700', avatar:5 },
                  { name:'David Smith', id:'PT-1923', time:'13:45', dur:'45 min', type:'Hemodialysis', st:'Scheduled', stc:'bg-gray-50 text-gray-700', avatar:2 },
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={`https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-${r.avatar}.jpg`}
                             className="w-8 h-8 rounded-full mr-3" alt="Patient Avatar" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{r.name}</p>
                          <p className="text-xs text-gray-500">ID: {r.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{r.time}</p>
                      <p className="text-xs text-gray-500">{r.dur}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="chip bg-blue-50 text-blue-700">{r.type}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`chip ${r.stc}`}>{r.st}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-primary-500"><i className="fa-solid fa-eye" /></button>
                        <button className="text-gray-400 hover:text-primary-500"><i className="fa-solid fa-pen-to-square" /></button>
                        <button className="text-gray-400 hover:text-red-500"><i className="fa-solid fa-xmark" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">Showing 4 of 36 appointments</p>
              <div className="flex space-x-1">
                <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50"><i className="fa-solid fa-chevron-left" /></button>
                <button className="px-3 py-1 text-sm bg-primary-500 border border-primary-500 rounded-md text-white">1</button>
                <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50">2</button>
                <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50">3</button>
                <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50"><i className="fa-solid fa-chevron-right" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita (monitor/alertas/recursos) */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Patient Monitor</h3>
              <button className="text-gray-400 hover:text-gray-600"><i className="fa-solid fa-ellipsis-vertical" /></button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" className="w-10 h-10 rounded-full mr-3" alt="Patient Avatar" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Station #4 • Started 1h 23m ago</p>
                </div>
              </div>
              <span className="chip bg-green-50 text-green-700">Stable</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Blood Pressure</p>
                <p className="text-lg font-semibold">120/80 <span className="text-xs font-normal text-gray-500">mmHg</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Heart Rate</p>
                <p className="text-lg font-semibold">72 <span className="text-xs font-normal text-gray-500">bpm</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Fluid Removal</p>
                <p className="text-lg font-semibold">1.2 <span className="text-xs font-normal text-gray-500">L</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Flow Rate</p>
                <p className="text-lg font-semibold">350 <span className="text-xs font-normal text-gray-500">mL/min</span></p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button className="text-sm text-primary-600 hover:text-primary-700"><i className="fa-solid fa-eye mr-1" /> View Details</button>
              <button className="text-sm text-white bg-primary-500 hover:bg-primary-600 px-3 py-1.5 rounded-md transition-colors duration-200">
                <i className="fa-solid fa-pen-to-square mr-1" /> Update Vitals
              </button>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Resource Availability</h3>
              <button className="text-gray-400 hover:text-gray-600"><i className="fa-solid fa-arrows-rotate" /></button>
            </div>

            {[
              { label:'Dialysis Machines', pct:75, text:'18/24 available' },
              { label:'Dialysate Solution', pct:82, text:'82% in stock' },
              { label:'Dialyzers',         pct:45, text:'45% in stock', warn:'text-yellow-500' },
              { label:'EPO Medication',    pct:12, text:'12% in stock', warn:'text-red-500' },
            ].map((r) => (
              <div key={r.label} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className={clsx('text-sm', r.warn ?? 'text-gray-500')}>{r.text}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}

            <button className="mt-4 w-full text-sm text-white bg-primary-500 hover:bg-primary-600 py-2 rounded-md transition-colors duration-200">
              <i className="fa-solid fa-cart-shopping mr-1" /> Order Supplies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
