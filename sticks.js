export const sticks = []
export let sortedSticks = sticks
export let t0 = 0

export function throwSticks(count = 0, len = .5, dev = 0.25){
	t0 = t
	sticks.length = 0
	let a = len-dev, step = dev*2/(count-1)
	const zoneBuf = (len+dev) * .5, zoneSize = 1-len-dev
	let L = .4, lstep = 0.25/count
	let th = random()*PI2
	while(count--){
		const r = cos(th)+1, g = cos(th+.6667*PI)+1, b = cos(th+1.3333*PI)+1
		th += random()*3-1
		sticks.push({
			r: random() * PI2, dr: random() * 2 - 1,
			done: false, length: a,
			x: random() * zoneSize + zoneBuf - .5, y: random() * zoneSize + zoneBuf,
			color: vec4(r*.2+L, g*.2+L, b*.2+L,1)
		})
		a += step; L += lstep
	}
	sortedSticks = sticks.slice()
	sticks.sort((a, b) => a.dr - b.dr)
}