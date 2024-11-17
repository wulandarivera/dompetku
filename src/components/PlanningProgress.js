import React from 'react';

import { View, Text, StyleSheet, Platform } from 'react-native';

import { COLORS, SIZES } from '../constants/theme';

import { Ionicons } from '@expo/vector-icons';



const PlanningProgress = ({ plannings = [] }) => {

  if (!plannings || plannings.length === 0) return null;



  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.title}>Target Saat Ini</Text>

      </View>



      <View style={styles.planningList}>

        {plannings.map((plan) => {

          const progress = (plan.currentAmount / plan.targetAmount) * 100;

          const formattedProgress = Math.min(Math.round(progress), 100);



          return (

            <View key={plan.id} style={styles.planningItem}>

              <View style={styles.planInfo}>

                <View style={[styles.iconContainer, { backgroundColor: `${plan.color}20` }]}>

                  <Ionicons name={plan.icon} size={24} color={plan.color} />

                </View>

                <View style={styles.planDetails}>

                  <Text style={styles.planName}>{plan.name}</Text>

                  <Text style={styles.planAmount}>

                    Rp {plan.currentAmount.toLocaleString('id-ID')} / Rp {plan.targetAmount.toLocaleString('id-ID')}

                  </Text>

                </View>

              </View>

              

              <View style={styles.progressContainer}>

                <View style={styles.progressBar}>

                  <View 

                    style={[

                      styles.progressFill,

                      { 

                        width: `${formattedProgress}%`,

                        backgroundColor: plan.color

                      }

                    ]} 

                  />

                </View>

                <Text style={[styles.progressText, { color: plan.color }]}>

                  {formattedProgress}%

                </Text>

              </View>

            </View>

          );

        })}

      </View>

    </View>

  );

};



const styles = StyleSheet.create({

  container: {

    backgroundColor: COLORS.white,

    marginTop: SIZES.padding,

    marginHorizontal: SIZES.padding,

    paddingHorizontal: SIZES.padding,

    paddingVertical: SIZES.padding,

    borderRadius: SIZES.radius,

    elevation: 3,

    shadowColor: COLORS.gray,

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.25,

    shadowRadius: 3.84,

  },

  header: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: SIZES.padding,

  },

  title: {

    fontSize: SIZES.medium,

    fontWeight: 'bold',

    color: COLORS.primary,

  },

  planningList: {

    gap: SIZES.padding,

  },

  planningItem: {

    gap: SIZES.base,

  },

  planInfo: {

    flexDirection: 'row',

    alignItems: 'center',

  },

  iconContainer: {

    width: 40,

    height: 40,

    borderRadius: 20,

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: SIZES.base,

  },

  planDetails: {

    flex: 1,

  },

  planName: {

    fontSize: SIZES.font,

    fontWeight: '600',

    color: COLORS.primary,

    marginBottom: 2,

  },

  planAmount: {

    fontSize: SIZES.font * 0.9,

    color: COLORS.gray,

  },

  progressContainer: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: SIZES.base,

  },

  progressBar: {

    flex: 1,

    height: 8,

    backgroundColor: COLORS.lightGray,

    borderRadius: 4,

    overflow: 'hidden',

  },

  progressFill: {

    height: '100%',

    borderRadius: 4,

  },

  progressText: {

    fontSize: SIZES.font * 0.9,

    fontWeight: '600',

    width: 45,

    textAlign: 'right',

  },

});



export default PlanningProgress; 
