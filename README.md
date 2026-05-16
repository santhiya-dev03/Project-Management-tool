# CollabBoard - Premium Project Management Tool

CollabBoard is a sophisticated, production-ready project management application designed for high-performance teams. It combines real-time collaboration, interactive data visualization, and a premium "Apple-like" aesthetic to provide a seamless workflow experience.

![CollabBoard Preview](https://raw.githubusercontent.com/santhiya-dev03/Project-Management-tool/main/public/preview.png)

## 🚀 Key Features

- **📊 Interactive Dashboards**: Real-time project health scores, task completion ratios, and activity monitoring.
- **📋 Multifaceted Task Views**:
  - **Kanban Board**: Drag-and-drop task management with instant state persistence.
  - **Calendar View**: Visualise deadlines and schedules in a sleek monthly layout.
  - **Gantt Timeline**: Track project progress and task dependencies over time.
- **💬 Real-time Collaboration**: Project-specific team chat with instant messaging powered by Supabase Realtime.
- **⏱️ Productivity Tools**:
  - Built-in **Task Timers** to track time spent on specific items.
  - **Subtasks** system for breaking down complex requirements.
  - Interactive **Comments** threads for team discussion.
- **📈 Advanced Analytics**: Dynamic charts (Bar, Pie, Area) for tracking team velocity and task distribution using Recharts.
- **👥 Team Management**: Role-based access control, performance metrics, and member invitations.
- **🛡️ Secure Profiles**: User authentication, profile avatar uploads to Supabase Storage, and "Danger Zone" security actions.
- **🌓 Adaptive UI**: Fully responsive design with native-feeling Light and Dark modes.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using the new `@theme` engine)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: Framer Motion & Tailwind Transitions

### State & Logic
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/)
- **Form/Feedback**: [Sonner](https://sonner.stevenly.me/) (Toasts)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Drag & Drop**: [@dnd-kit](https://dnd-kit.com/)

### Backend (BaaS)
- **Service**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL with Realtime enabled
- **Storage**: Profile picture management via S3-compatible buckets
- **Auth**: Secure JWT-based authentication

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/santhiya-dev03/Project-Management-tool.git
   cd Project-Management-tool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Santhiya](https://github.com/santhiya-dev03)
