import { NavLink } from 'react-router'

function Sidebar() {
    return (
        <aside className="sidebar">
            <NavLink to="/" className="brand" aria-label="Место — расписание">
                <svg
                    className="brand__mark"
                    viewBox="0 0 48 40"
                    fill="none"
                    aria-hidden="true"
                >
                    <path d="M2 36 17 14 32 36Z" fill="currentColor" opacity=".55" />
                    <path d="M15 36 31 3 47 36Z" fill="currentColor" />
                    <path d="m25 15 6-12 6 12-6-4Z" fill="#fff" opacity=".9" />
                </svg>

                <span>Место</span>
            </NavLink>

            <nav className="app-nav" aria-label="Основная навигация">
                <NavLink to="/" end>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="4" y="5" width="16" height="16" rx="2" />
                        <path d="M8 3v4m8-4v4M4 11h16" />
                    </svg>
                    <span>Расписание</span>
                </NavLink>

                <NavLink to="/rooms">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 21V4l12-2v19M3 21h18M17 5h3v16" />
                        <path d="M13 12h.01" />
                    </svg>
                    <span>Переговорные</span>
                </NavLink>

                <NavLink to="/bookings">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="5" y="3" width="14" height="18" rx="2" />
                        <path d="M9 8h6m-6 4h6m-6 4h4" />
                    </svg>
                    <span>Бронирования</span>
                </NavLink>
            </nav>

            <div className="sidebar__footer">
                <p>Больше пространства<br />для важных встреч</p>

                <svg
                    className="sidebar__landscape"
                    viewBox="0 0 240 150"
                    preserveAspectRatio="xMidYMax slice"
                    aria-hidden="true"
                >
                    <path
                        d="m0 100 45-52 30 26 55-70 55 65 25-20 30 40v61H0Z"
                        fill="currentColor"
                        opacity=".15"
                    />
                    <path
                        d="m0 125 57-48 39 35 44-57 60 62 40-27v60H0Z"
                        fill="currentColor"
                        opacity=".2"
                    />
                    <path
                        d="m0 140 35-25 30 15 38-26 44 27 35-17 58 26v10H0Z"
                        fill="currentColor"
                        opacity=".25"
                    />
                </svg>
            </div>
        </aside>
    )
}

export default Sidebar