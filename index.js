import { sortedSticks, sticks, t0, throwSticks } from "./sticks.js"
import { pointyShader } from "./shaders.js"

const locus = await Font.chlumsky('./locus/index.json', './locus/atlas.png')

let correct = -1
const STICK_WIDTH = .015, STICK_SELECT_DIST = 0.03, I_SW = 1/STICK_WIDTH, I_SD = 1/(STICK_WIDTH+STICK_SELECT_DIST)
const cursorCol = vec4(.3), cursorPressCol = vec4(1)
let wrongStick = null
let clickCooldown = 0, hover = null, y0 = 0

let level = 0, timeLeft = 0, totalTime = 0, playing = false, madeMistake = false
let points = 0
const nextLevel = () => {
	points += round(timeLeft*level*.3)
	if(!madeMistake) points += level*2
	throwSticks(4 + (++level), .25, 2/(12+level))
	timeLeft = totalTime = 6 + level*.5
	correct = 0; madeMistake = false
}

let hovDst = Infinity, t1 = 0
const drawStick = s => {
	const c2 = ctx.sub()
	c2.translate(s.x*(1-t1), (s.y+y0)*(1-t1))
	c2.rotate(s.r + t1*s.dr)
	if(!clickCooldown){
		const {x, y} = c2.from(cursor), dy = abs(y)-(s.length+STICK_SELECT_DIST)*.5, hv = x*x+(dy>0?dy*dy:0)
		if(!s.done && hv < hovDst){
			hover = s, hovDst = hv
		}
	}
	c2.drawRect(-.5*STICK_WIDTH, -.5*s.length, STICK_WIDTH, s.length, s.color, s.length*I_SW)
}
let titleW = locus.measure(title = 'Stick sort')
ctxSupersample = 2
icon = './icon.png'

const playW = locus.measure('Click anywhere to play')
throwSticks(8, .25, .125)
render = () => {
	cursorType = 'none'
	let h0 = min(ctx.width, ctx.height)
	const w = ctx.width/h0
	ctx.reset(h0/ctx.width, 0, 0, h0 /= ctx.height, .5, 0)
	y0 = (1/h0-1)*.5
	if(wrongStick) ctx.clear(clickCooldown*.5,0,0,1)
	if(clickCooldown && (clickCooldown -= dt+dt) <= 0){
		clickCooldown = 0, wrongStick = null
		if(correct == sortedSticks.length) nextLevel()
	}else if(correct == sortedSticks.length){
		const df = .0001**((.5-clickCooldown)*dt)
		for(const s of sortedSticks) s.x *= df, s.y *= df
	}
	t1 = exp((t0 - t) * 4)
	if(playing){
		if(correct < sortedSticks.length && (timeLeft -= dt) < 0){
			clickCooldown = 1, wrongStick = null, hover = sortedSticks[correct]
			if(playing) titleW = locus.measure(title = 'Game over')
			playing = false; hovDst = -1
		}else hovDst = Infinity
	}else hovDst = -1
	ctx.shader = pointyShader
	for(let i = 0; i < correct; i++) drawStick(sortedSticks[i])
	ctx.mask |= SET
	for(const s of sticks) if(!s.done) drawStick(s)
	const col = keys.has(MOUSE.LEFT) ? cursorPressCol : cursorCol
	if(hover){
		const c2 = ctx.sub()
		c2.mask = RGBA | IF_UNSET
		c2.translate(hover.x*(1-t1), (hover.y+y0)*(1-t1))
		c2.rotate(hover.r + t1*hover.dr)
		const w1 = hover.length + STICK_SELECT_DIST
		c2.drawRect(-.5*(STICK_WIDTH+STICK_SELECT_DIST), -.5*w1, STICK_WIDTH+STICK_SELECT_DIST, w1, col, w1*I_SD)
	}
	ctx.clearStencil()
	const {x, y} = ctx.from(cursor)
	ctx.mask = RGBA; ctx.shader = Shader.AA_CIRCLE
	ctx.drawRect(x-.01, y-.01, .02, .02, col)
	ctx.shader = null
	if(level){
		const c2 = ctx.sub()
		c2.drawRect(-.5*w, 0, (timeLeft/totalTime)*w, .02, vec4.one)
		c2.scale(.05)
		const txt = 'Level '+level
		const w1 = locus.measure(txt)
		c2.translate(-.5*w1, 1.5)
		locus.draw(c2.sub(), txt)
		c2.translate(.5*w1, -.6)
		c2.scale(.5)
		const txt2 = 'Points: '+points
		const w2 = locus.measure(txt2)
		c2.translate(-.5*w2)
		locus.draw(c2.sub(), txt2, _, _, vec4(.5,.5,.5,1))
	}
	if(!playing){
		const c2 = ctx.sub()
		c2.scale(.1)
		c2.translate(-.5*titleW, 8)
		let c3 = c2.sub()
		c3.translate(cos(t)*.1, sin(t)*-.1)
		locus.draw(c3, title, _, _, vec4(.25,.25,.25,1))
		locus.draw(c2.sub(), title, _, _, level ? vec4(.8,.1,0,1) : vec4.one)
		c2.translate(.5*titleW, -6)
		c2.scale(.5)
		c2.translate(-.5*playW, 0)
		const a = .3+.1*sin(PI*t)
		if(!level) locus.draw(c2.sub(), 'Click anywhere to play', _, _, vec4(a,a,a,1))
		hovDst = -1
	}
}
onKey(MOUSE.LEFT, () => {
	if(!playing && !clickCooldown) return level = 0, points = 0, nextLevel(), playing = true
	if(correct >= sortedSticks.length || clickCooldown || !hover) return
	if(sortedSticks[correct] == hover){
		hover.color = hover.color.times(.25)
		hover.done = true
		hover = null
		timeLeft += .5
		points++
		if(++correct == sortedSticks.length) clickCooldown = .5, hover = null
	}else clickCooldown = 1, wrongStick = hover, hover = null, madeMistake = true
})