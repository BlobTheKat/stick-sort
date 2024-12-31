Shader.AA_CIRCLE ??= Shader(`
void main(){
	float dist = 0.5 - length(uv - 0.5);

	// Make [0, 1] the range covered by one pixel
	float alpha = clamp(dist/fwidth(dist) + 0.5, 0.0, 1.0);

	color = arg0() * alpha;
}
`, COLOR)

export const pointyShader = Shader(`
void main(){
	vec2 c = abs(uv*2.-1.);
	if(c.x+c.y*arg1 > arg1) discard;
	color = arg0;
}
`, [VEC4, FLOAT])