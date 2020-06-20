import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, forwardRef} from 'react';
import { Canvas, createPortal } from 'react-three-fiber';
import Controls from '../Controls';
import Effects from './effects.jsx';
import Lines from './lines.jsx';
import Ancestor from '../Ancestor/index.jsx';
import Sidebar from '../Sidebar/index.jsx';

import Loader from '../Loader/index.jsx';

import { useObserver } from "mobx-react-lite";
import { useStore } from "../../hooks/useStore";
import styles from './Ancestors.module.css';
import { observe } from 'mobx';
import * as THREE from 'three';
import { useThree } from 'react-three-fiber'

const Ancestors = () => {
  const { ancestorStore } = useStore();
  const [preview, setPreview] = useState(false);
  const [ancestor, setAncestor] = useState(null);
  const [canvas, setCanvas] = useState(false);
  let ancestors = ancestorStore.ancestors;

  const scrolliconRef = useRef();

  /* eerste keer site inladen */
  const stopObserve = observe(ancestorStore, (change) => {
    if (change.name === 'loadAllComplete') {
      setCanvas(true);
    }
  });

  /* wordt ook opgeroepen indien je komt vanuit ander component */
  useLayoutEffect(() => {
    if (ancestorStore.loadAllComplete && !canvas) {
      setCanvas(true);
    }
  }, [canvas, ancestors]);

  const handleClickAncestor = (e) => {
    e.stopPropagation();
    const clickedAncestor = ancestorStore.getAncestorById(e.eventObject.ancestorId);
    setPreview(true);
    setAncestor(clickedAncestor);
  };

  const canvasCreated = (gl) => {
    gl.setClearColor('#1c1c1c');
    gl.domElement.addEventListener('wheel', () => {
      scrolliconRef.current.classList.add(styles.iconscrollHidden);
      console.log(scrolliconRef.current);
      // setScrollicon(false);
    });
  }

  const CanvasView = () => {
    return (
      <Canvas
        camera={{
          fov: 70,
          position: [0, 0, 63],
          near: 0.1,
          far: 500,
        }}
        onCreated={({ gl }) => canvasCreated(gl)}
      >
        <Lines />
        <Controls />
        <ambientLight color="#ffffff" intensity={0.1} />
        <pointLight position={[10, 10, 10]} />
        {ancestors.map((ancestor) => (
          <group
            key={ancestor.id}
            ancestorId={ancestor.id}
            onClick={(e) => handleClickAncestor(e)}
          >
            <Ancestor ancestor={ancestor} ancestorStore={ancestorStore} />
          </group>
        ))}
      </Canvas>
    );
  };

  return (
    <>
      <Sidebar
        type={'preview'}
        content={ancestor}
        toggle={preview}
        setToggle={setPreview}
      />
      <div
        ref={scrolliconRef}
        className={canvas ? styles.iconscroll : ''}
      />
      <div className={styles.canvas__container}>
        {canvas ? <CanvasView /> : <Loader />}
      </div>
    </>
  );

};

export default Ancestors;