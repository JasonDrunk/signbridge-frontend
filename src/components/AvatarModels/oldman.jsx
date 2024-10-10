import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import glosses from "../../../public/glosses/gloss.json";
import { useTranslation } from "react-i18next";

const Man = ({
  props,
  animationKeyword,
  speed = 1,
  showSkeleton,
  repeat,
  isPaused,
  updateCurrentAnimationName = () => {},
  updateCurrentSignFrame = () => {},
  updateStatus = () => {},
}) => {
  const { t, i18n } = useTranslation();
  const group = useRef();
  const skeletonHelperRef = useRef(null);
  const { nodes, materials, animations } = useGLTF("../../../public/models/man.glb");
  const { actions } = useAnimations(animations, group);

  const [animationQueue, setAnimationQueue] = useState([]);
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [prevAnimationKeyword, setPrevAnimationKeyword] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  // let timerShouldRun = true; // Flag to control timer execution
  const frameRate = 30;

  useEffect(() => {
    if (animationKeyword && animationKeyword !== prevAnimationKeyword) {
      const sanitizedAnimationKeyword = animationKeyword.replace(/\+/g, ' ');
      const animationKeywords = sanitizedAnimationKeyword.split(" ");
      let newAnimationQueue = [];
      let newSignFrames = [];

      for (let i = animationKeywords.length; i >= 1; i--) {
        const combinedKeyword = animationKeywords.slice(0, i).join(" ").toUpperCase();
        const animationData = glosses.find((item) => item.keyword === combinedKeyword);

        if (animationData) {
          newAnimationQueue.push(...animationData.animations);
          newSignFrames.push(animationData.frames);
          animationKeywords.splice(0, i);
          i = animationKeywords.length + 1;
        }
      }

      animationKeywords.forEach((keyword) => {
        const singleKeyword = keyword.toUpperCase();
        const animationData = glosses.find((item) => item.keyword === singleKeyword);
        if (animationData) {
          newAnimationQueue.push(...animationData.animations);
          newSignFrames.push(animationData.frames);
        }
      });

      setAnimationQueue(newAnimationQueue);
      setCurrentAnimationIndex(0);
      setPrevAnimationKeyword(animationKeyword);

      if (newSignFrames.length > 0) {
        updateCurrentSignFrame(newSignFrames[0]);
      }
    }
  }, [animationKeyword, prevAnimationKeyword, updateCurrentSignFrame]);

  useEffect(() => {
    if (animationQueue.length === 0) {
      updateStatus(t("avatar_idle"));
    } else if (isPaused) {
      updateStatus(t("avatar_pause"));
    } else if (animationQueue.length > 0) {
      updateStatus(t("avatar_playing"));
    }
  }, [animationQueue, isPaused, updateStatus]);

  const onAnimationFinished = () => {
    if (currentAnimationIndex < animationQueue.length - 1) {
      setCurrentAnimationIndex((prevIndex) => prevIndex + 1);
      // stopTimer();
    } else if (repeat === "Yes") {
      setTimeout(() => {
        setAnimationQueue([]);
        setCurrentAnimationIndex(0);
        setPrevAnimationKeyword(null);
      }, 2000);
    }
    // else if(currentAnimationIndex === animationQueue.length - 1){
    //   timerShouldRun = false; // Stop the timer
    //   stopTimer();
    // }
  };

  useEffect(() => {
    const playNextAnimation = () => {
      const animationName = animationQueue[currentAnimationIndex];
      const nextAction = actions[animationName];

      if (nextAction) {
        
        if (speed) {
          nextAction.setEffectiveTimeScale(speed);
        }
        // if(timerShouldRun){
        //   startTimer(); // Start the timer
        // }

        nextAction.reset().fadeIn(0.5).play();
        nextAction.setLoop(THREE.LoopOnce);
        nextAction.getMixer().addEventListener("finished", onAnimationFinished);
        nextAction.clampWhenFinished = true;

        setCurrentAction(nextAction);

        updateCurrentAnimationName(animationName);

        const animationData = glosses.find((item) => item.animations.includes(animationName));
        if (animationData) {

          updateCurrentSignFrame(animationData.frames);
        }
      }
    };

    if (!isPaused && animationQueue.length > 0) {
      playNextAnimation();
    }

    return () => {
      const animationName = animationQueue[currentAnimationIndex];
      const nextAction = actions[animationName];

      if (nextAction) {
        nextAction.fadeOut(0.5);
        nextAction.getMixer().removeEventListener("finished", onAnimationFinished);
      }
    };
  }, [animationQueue, currentAnimationIndex, actions, speed, isPaused, updateCurrentAnimationName, updateCurrentSignFrame]);

  useEffect(() => {
    if (currentAction) {
      currentAction.paused = isPaused;
    }
  }, [isPaused, currentAction]);

  useEffect(() => {
    if (showSkeleton && !skeletonHelperRef.current) {
      const helper = new THREE.SkeletonHelper(group.current);
      helper.position.set(0, 100, 0);
      group.current.add(helper);
      skeletonHelperRef.current = helper;
    } else if (!showSkeleton && skeletonHelperRef.current) {
      group.current.remove(skeletonHelperRef.current);
      skeletonHelperRef.current = null;
    }
  }, [showSkeleton]);

  // async function startTimer() {
  //   return new Promise((resolve) => {
  //     let startTime = Date.now();
    
  //     const timerInterval = setInterval(() => {
  //       if (!timerShouldRun) {
  //         clearInterval(timerInterval); // Stop the timer if flag is false
  //         resolve(); // Resolve the promise
  //         return;
  //       }
  //       const elapsedTime = Date.now() - startTime;
  //       const seconds = Math.floor(elapsedTime / 1000);
  //       const milliseconds = Math.floor(elapsedTime % 1000);
  //       console.log(`Time elapsed: ${seconds}.${milliseconds} seconds`);
  //     }, 100); // Update the counter every 100 milliseconds (0.1 second)
  //   });
  // }
  
  // async function stopTimer(timerInterval) {
  //   clearInterval(timerInterval);
  // }
  

  return (
    <group ref={group} {...props} position={[0, 0, 0]} dispose={null}>
      <group name="Scene">
        <group name="Armature001" rotation={[1.829, 0, 0]}>
          <primitive object={nodes.root} />
          <primitive object={nodes.Bone} />
          <group name="rp_manuel_animated_001_dancing_geo">
            <skinnedMesh name="Mesh003" geometry={nodes.Mesh003.geometry} material={materials['rp_manuel_animated_001_mat.005']} skeleton={nodes.Mesh003.skeleton} />
            <skinnedMesh name="Mesh003_1" geometry={nodes.Mesh003_1.geometry} material={materials.Tongue} skeleton={nodes.Mesh003_1.skeleton} />
          </group>
        </group>
      </group>
    </group>
  );
};

export default Man;
