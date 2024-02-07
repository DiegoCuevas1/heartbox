
const Button = ({text }: { text: string }) =>
{
  return <button className={`z-[-1] w-[170px] h-[40px] rounded-[25px] text-white drop-shadow-xl bg-[#CA384B] hover:cursor-pointer hover:bg-[#d94e60] active:scale-95 transition-all font-semibold hover:scale-110`}>{text}</button>
}

export default Button;