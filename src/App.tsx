import { CreateTask } from "./components/CreateTask";
import { CreateUser } from "./components/CreateUser";
import { TaskDataTable } from "./components/TaskDataTable";
import { UserDataTable } from "./components/UserDataTable";

function App() {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">The ToDo App</h1>
      </header>

      {/* Forms Group */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="w-full md:w-1/3">
            <CreateUser />
          </div>
          <div className="w-full md:w-1/3">
            <CreateTask />
          </div>
        </div>
      </section>

      {/* Data Tables Group */}
      <section>
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-full md:w-1/2">
            <UserDataTable />
          </div>
          <div className="w-full md:w-1/2">
            <TaskDataTable />
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
