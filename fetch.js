export async function test() { 
    const request = await fetch("http://wordnetweb.princeton.edu/perl/webwn?s=quintillion&o0=1&o1=1");
    const text = await request.text();
    console.log(request, text);
}