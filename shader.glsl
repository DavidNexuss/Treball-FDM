vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 colorRamp(float t) { 
    vec3 up = vec3(0.5,0.5,1);
    vec3 down = vec3(1,-0.2,-0.2);

    return up * t + down * (1.0 - t);
}

//Return world coordinates
vec2 getSt() { 
    vec2 st = gl_FragCoord.xy / iResolution.xy;
    st = st - 0.5;
    st = st * 2.0 * 10.0;
    return st;
}

//Ligth wave intensity value for a wave with frequency w
float light(vec2 st, float t) {
    float w = 0.2;
    float l = length(vec3(st.x, st.y, 0));
    return sin(l - t * w) * 0.5 + 0.5;
}

//Inverse square intensity falloff
float lightValue(vec2 st) { 
    return 1.0 / sqrt(st.x * st.x + st.y * st.y);
}


//Show light wave for centered omni light
float test1(vec2 st, float t) { 
    return light(st * 10.0, t);
}

//Show light intensity for same case than 1
float test2(vec2 st, float t) { 
    return lightValue(st);
}

//Combine both graphs, with interference pattern combined with p1 and p2
float test3(vec2 st, float t) { 
    st = st * 20.0;
    vec2 p1 = vec2(30.0,0.0) + st;
    vec2 p2 = vec2(-30.0,0.0) + st;

    return (light(p1, t) + light(p2, t)) * 0.5;
}

//Single slip experiment
float test4(vec2 st, float t)
{
    st = st * 100.0;
    float result = 0.0;
    float resultValue = 0.0;
    float altResult = 0.0;

    float count = 0.0;
    for(float k = 0.0; k <= 2.0; k+= 2.0) { 
    for(float i = -1.0; i < 2.0; i+= 0.1) { 
        count++;
        vec2 off = vec2(10.0,-10.3 + i + k * 6.0 * sin(iTime * 0.002)) * 10.0;
        vec2 p = off + st;
        float lig = light(p, t);
        altResult = max(lig, altResult);
        result += lig;
        resultValue += lightValue(p);
    }
    }

    result /= count;
    return result;
}

float fft(vec2 st, float t) { 
    //st *= 100.0;
    float maxF = -100.0;
    float minF = 100.0;

    for(float x = 0.0; x < 1000.0; x+= 100.0) { 
        float l = test3(st, t + x);
        maxF = max(maxF, l);
        minF = min(minF, l);
    }
    return maxF - minF;
}

float plotFft(vec2 st, float t) { 
    float value = fft(vec2(1.0,st.x * 0.6), t);

    float func = max(1.0 - abs(value - st.y),0.0);
    if(func < 0.98) return pow(func, 40.0);
    return func;
}
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec3 color = vec3(0.0);
    vec2 st = getSt();
    float result = test3(st, iTime * 30.0);
    result += plotFft(st - vec2(0,3.5), iTime);
    color = vec3(result);
    
    fragColor.xyz = color;
}

