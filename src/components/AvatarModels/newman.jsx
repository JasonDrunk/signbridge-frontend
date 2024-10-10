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
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Genesis8Female" scale={100.6}>
          <primitive object={nodes.root} />
          <group name="Genesis8FemaleShape">
            <skinnedMesh name="Genesis8Female001" geometry={nodes.Genesis8Female001.geometry} material={materials['drb_Torso-dz0.001']} skeleton={nodes.Genesis8Female001.skeleton} />
            <skinnedMesh name="Genesis8Female001_1" geometry={nodes.Genesis8Female001_1.geometry} material={materials['drb_Face-dz0.001']} skeleton={nodes.Genesis8Female001_1.skeleton} />
            <skinnedMesh name="Genesis8Female001_2" geometry={nodes.Genesis8Female001_2.geometry} material={materials['drb_Lips-dz0.001']} skeleton={nodes.Genesis8Female001_2.skeleton} />
            <skinnedMesh name="Genesis8Female001_3" geometry={nodes.Genesis8Female001_3.geometry} material={materials['drb_Teeth-dz0.001']} skeleton={nodes.Genesis8Female001_3.skeleton} />
            <skinnedMesh name="Genesis8Female001_4" geometry={nodes.Genesis8Female001_4.geometry} material={materials['drb_Ears-dz0.001']} skeleton={nodes.Genesis8Female001_4.skeleton} />
            <skinnedMesh name="Genesis8Female001_5" geometry={nodes.Genesis8Female001_5.geometry} material={materials['drb_Legs-dz0.001']} skeleton={nodes.Genesis8Female001_5.skeleton} />
            <skinnedMesh name="Genesis8Female001_6" geometry={nodes.Genesis8Female001_6.geometry} material={materials['drb_EyeSocket-dz0.001']} skeleton={nodes.Genesis8Female001_6.skeleton} />
            <skinnedMesh name="Genesis8Female001_7" geometry={nodes.Genesis8Female001_7.geometry} material={materials['drb_Mouth-dz0.001']} skeleton={nodes.Genesis8Female001_7.skeleton} />
            <skinnedMesh name="Genesis8Female001_8" geometry={nodes.Genesis8Female001_8.geometry} material={materials['drb_Arms-dz0.001']} skeleton={nodes.Genesis8Female001_8.skeleton} />
            <skinnedMesh name="Genesis8Female001_9" geometry={nodes.Genesis8Female001_9.geometry} material={materials['drb_Pupils-dz0.001']} skeleton={nodes.Genesis8Female001_9.skeleton} />
            <skinnedMesh name="Genesis8Female001_10" geometry={nodes.Genesis8Female001_10.geometry} material={materials['drb_EyeMoisture-dz0.001']} skeleton={nodes.Genesis8Female001_10.skeleton} />
            <skinnedMesh name="Genesis8Female001_11" geometry={nodes.Genesis8Female001_11.geometry} material={materials['drb_Fingernails-dz0.001']} skeleton={nodes.Genesis8Female001_11.skeleton} />
            <skinnedMesh name="Genesis8Female001_12" geometry={nodes.Genesis8Female001_12.geometry} material={materials['drb_Cornea-dz0.001']} skeleton={nodes.Genesis8Female001_12.skeleton} />
            <skinnedMesh name="Genesis8Female001_13" geometry={nodes.Genesis8Female001_13.geometry} material={materials['drb_Irises-dz0.001']} skeleton={nodes.Genesis8Female001_13.skeleton} />
            <skinnedMesh name="Genesis8Female001_14" geometry={nodes.Genesis8Female001_14.geometry} material={materials['drb_Sclera-dz0.001']} skeleton={nodes.Genesis8Female001_14.skeleton} />
            <skinnedMesh name="Genesis8Female001_15" geometry={nodes.Genesis8Female001_15.geometry} material={materials['drb_Toenails-dz0.001']} skeleton={nodes.Genesis8Female001_15.skeleton} />
            <skinnedMesh name="Genesis8Female001_16" geometry={nodes.Genesis8Female001_16.geometry} material={materials['drb_EylsMoisture-dz0.001']} skeleton={nodes.Genesis8Female001_16.skeleton} />
            <skinnedMesh name="Genesis8Female001_17" geometry={nodes.Genesis8Female001_17.geometry} material={materials['drb_Eyelashes-dz0.001']} skeleton={nodes.Genesis8Female001_17.skeleton} />
          </group>
          <group name="Pumps01_5112Shape">
            <skinnedMesh name="Pumps01_5112" geometry={nodes.Pumps01_5112.geometry} material={materials['inner_sole.001']} skeleton={nodes.Pumps01_5112.skeleton} />
            <skinnedMesh name="Pumps01_5112_1" geometry={nodes.Pumps01_5112_1.geometry} material={materials['sole.001']} skeleton={nodes.Pumps01_5112_1.skeleton} />
            <skinnedMesh name="Pumps01_5112_2" geometry={nodes.Pumps01_5112_2.geometry} material={materials['body.001']} skeleton={nodes.Pumps01_5112_2.skeleton} />
          </group>
          <skinnedMesh name="ANTO_STUDIO_7891Shape" geometry={nodes.ANTO_STUDIO_7891Shape.geometry} material={materials['Model001_Material001.001']} skeleton={nodes.ANTO_STUDIO_7891Shape.skeleton} morphTargetDictionary={nodes.ANTO_STUDIO_7891Shape.morphTargetDictionary} morphTargetInfluences={nodes.ANTO_STUDIO_7891Shape.morphTargetInfluences} />
          <skinnedMesh name="untitled_74704Shape" geometry={nodes.untitled_74704Shape.geometry} material={materials['sleeves_FRONT_9234.001']} skeleton={nodes.untitled_74704Shape.skeleton} morphTargetDictionary={nodes.untitled_74704Shape.morphTargetDictionary} morphTargetInfluences={nodes.untitled_74704Shape.morphTargetInfluences} />
        </group>
      </group>
    </group>
  )
}

export default Man;
