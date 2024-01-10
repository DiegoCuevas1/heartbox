
const Button = ({text }: { text: string }) =>
{
  return <button className={`w-[170px] h-[40px] rounded-[25px] text-white drop-shadow-xl bg-default hover:cursor-pointer hover:bg-[#d94e60] active:scale-95 transition-all`}>{text}</button>
}

export default Button;