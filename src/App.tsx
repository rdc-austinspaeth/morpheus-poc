import React from 'react';

import './App.css';



export const App = () => {
  const [output, setOutput] = React.useState(null);
  const [stopwatch, setStopWatch]: any = React.useState(null);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    let startTime = new Date().getTime();
    
    const inputText = event.target.value;

    const worker = new Worker('/workers/saveTheThread.js', { type: 'module' });
    
    worker.onmessage = (event) => {
      setOutput(event.data);
      setStopWatch(new Date().getTime() - startTime);
    }
  
    worker.postMessage({
      string: inputText,
    });
  }

  return (
    <>
      {stopwatch && <div className='speed'>Webworker took: <b>{stopwatch?.length > 1 ? stopwatch.substring(0, stopwatch?.length - 2) : stopwatch}ms</b></div>}
      <img className='logo' src='/morph_logo.svg' alt='Morepheus' />
      <section className='inputContainer'>
        <input onChange={handleInput} className='demoInput' placeholder='What do you want?' type='text' />
        <div className='tagline'>After this, there is <span>no turning back</span>.</div>
      </section>
      <section className={`outputContainer ${output ? 'activeOutput' : ''}`}>
        <div className='output'>{JSON.stringify(output, null, 2)}</div>
      </section>
    </>
  )
}

export default App
