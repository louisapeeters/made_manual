import { Link, useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/OnboardingContext'
import { TEAMS } from '../data/onboarding'

export default function OnboardingTeamSelect() {
  const navigate = useNavigate()
  const { team: currentTeam, started, selectTeam, beginOnboarding } = useOnboarding()

  function handleSelect(team) {
    selectTeam(team)
    beginOnboarding()
    navigate('/onboarding')
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col px-6 sm:px-10 lg:px-16 pt-6 sm:pt-10 pb-6 sm:pb-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-[15px] text-made-neutral-100 hover:text-[#6324F3] transition-colors"
      >
        <span>←</span> Go back
      </Link>

      <h2 className="mt-8 sm:mt-12 lg:mt-16 text-[16px] sm:text-[18px] font-normal text-made-neutral-100">
        Which team are you joining?
      </h2>

      <ul className="flex-1 mt-auto flex flex-col justify-end pt-6 sm:pt-8 w-full">
        {TEAMS.map(team => (
          <li key={team} className="border-b border-[#EDEDED] last:border-b-0">
            <button
              onClick={() => handleSelect(team)}
              className="w-full flex items-center justify-between gap-6 py-[clamp(10px,1.6vh,28px)] group cursor-pointer text-left"
            >
              <span className="font-head text-[clamp(20px,min(calc((100vh-460px)/6),6.5vw),96px)] font-medium tracking-[-0.02em] leading-[1.2] text-made-neutral-100 group-hover:text-[#6324F3] transition-colors min-w-0 truncate pb-[0.05em]">
                {team}
              </span>
              <span className="shrink-0 text-[clamp(16px,min(2.6vh,2.2vw),40px)] text-made-neutral-100 group-hover:text-[#6324F3] group-hover:translate-x-2 transition-all duration-200">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
