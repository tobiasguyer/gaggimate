#ifndef EEZ_LVGL_UI_SCREENS_H
#define EEZ_LVGL_UI_SCREENS_H

#include <lvgl.h>

#ifdef __cplusplus
extern "C" {
#endif

// Screens

enum ScreensEnum {
    _SCREEN_ID_FIRST = 1,
    SCREEN_ID_NEW_STANDBY_SCREEN = 1,
    SCREEN_ID_STANDBY_SCREEN = 2,
    SCREEN_ID_BREW_SCREEN = 3,
    SCREEN_ID_STATUS_SCREEN = 4,
    SCREEN_ID_MENU_SCREEN = 5,
    SCREEN_ID_MENU_SCREEN_NEW = 6,
    SCREEN_ID_STEAM_SCREEN = 7,
    SCREEN_ID_WATER_SCREEN = 8,
    SCREEN_ID_PROFILE_SCREEN = 9,
    SCREEN_ID_GRIND_SCREEN = 10,
    SCREEN_ID_INFO_SCREEN = 11,
    SCREEN_ID_NEW_PROFILE_SCREEN = 12,
    _SCREEN_ID_LAST = 12
};

typedef struct _objects_t {
    lv_obj_t *new_standby_screen;
    lv_obj_t *standby_screen;
    lv_obj_t *brew_screen;
    lv_obj_t *status_screen;
    lv_obj_t *menu_screen;
    lv_obj_t *menu_screen_new;
    lv_obj_t *steam_screen;
    lv_obj_t *water_screen;
    lv_obj_t *profile_screen;
    lv_obj_t *grind_screen;
    lv_obj_t *info_screen;
    lv_obj_t *new_profile_screen;
    lv_obj_t *obj0;
    lv_obj_t *obj0__hours_1;
    lv_obj_t *obj0__min;
    lv_obj_t *obj0__obj0;
    lv_obj_t *obj0__hours;
    lv_obj_t *obj0__obj1;
    lv_obj_t *obj0__sec;
    lv_obj_t *obj1;
    lv_obj_t *obj1__obj6;
    lv_obj_t *obj1__obj7;
    lv_obj_t *obj1__obj8;
    lv_obj_t *obj1__obj9;
    lv_obj_t *obj1__obj10;
    lv_obj_t *obj1__obj11;
    lv_obj_t *obj1__obj12;
    lv_obj_t *obj1__obj13;
    lv_obj_t *obj1__obj14;
    lv_obj_t *obj1__obj15;
    lv_obj_t *obj1__obj16;
    lv_obj_t *obj1__obj17;
    lv_obj_t *obj1__obj18;
    lv_obj_t *obj1__obj19;
    lv_obj_t *obj1__obj20;
    lv_obj_t *obj1__obj21;
    lv_obj_t *obj1__obj22;
    lv_obj_t *obj1__obj23;
    lv_obj_t *obj1__obj24;
    lv_obj_t *obj1__obj25;
    lv_obj_t *obj1__obj26;
    lv_obj_t *obj1__obj27;
    lv_obj_t *obj1__obj28;
    lv_obj_t *obj1__obj29;
    lv_obj_t *obj1__obj30;
    lv_obj_t *obj1__obj31;
    lv_obj_t *obj1__obj32;
    lv_obj_t *obj1__obj33;
    lv_obj_t *obj1__obj34;
    lv_obj_t *obj1__obj35;
    lv_obj_t *obj1__obj36;
    lv_obj_t *obj1__obj37;
    lv_obj_t *obj1__obj38;
    lv_obj_t *obj1__obj39;
    lv_obj_t *obj1__obj40;
    lv_obj_t *obj1__obj41;
    lv_obj_t *obj2;
    lv_obj_t *obj2__hours_2;
    lv_obj_t *obj2__min_1;
    lv_obj_t *obj2__hours_3;
    lv_obj_t *obj2__obj42;
    lv_obj_t *obj2__sec_1;
    lv_obj_t *obj3;
    lv_obj_t *obj3__obj43;
    lv_obj_t *obj3__obj44;
    lv_obj_t *obj3__obj45;
    lv_obj_t *obj3__obj46;
    lv_obj_t *obj3__obj47;
    lv_obj_t *obj3__obj48;
    lv_obj_t *obj3__obj49;
    lv_obj_t *obj3__min_2;
    lv_obj_t *obj3__hours_5;
    lv_obj_t *obj4;
    lv_obj_t *obj4__obj50;
    lv_obj_t *obj4__obj51;
    lv_obj_t *obj4__obj52;
    lv_obj_t *obj4__obj53;
    lv_obj_t *obj4__obj54;
    lv_obj_t *obj4__obj55;
    lv_obj_t *obj4__obj56;
    lv_obj_t *obj4__min_3;
    lv_obj_t *obj4__hours_6;
    lv_obj_t *obj5;
    lv_obj_t *obj5__hours_7;
    lv_obj_t *obj5__min_4;
    lv_obj_t *obj5__sec_2;
    lv_obj_t *obj5__obj93;
    lv_obj_t *obj6;
    lv_obj_t *obj6__hours_8;
    lv_obj_t *obj6__min_5;
    lv_obj_t *obj6__sec_3;
    lv_obj_t *obj7;
    lv_obj_t *obj7__min_6;
    lv_obj_t *obj7__obj94;
    lv_obj_t *obj7__hours_9;
    lv_obj_t *obj8;
    lv_obj_t *obj8__min_7;
    lv_obj_t *obj8__obj95;
    lv_obj_t *obj8__hours_10;
    lv_obj_t *obj8__obj96;
    lv_obj_t *obj9;
    lv_obj_t *obj9__hours_11;
    lv_obj_t *obj9__min_8;
    lv_obj_t *brew_dials;
    lv_obj_t *brew_dials__temp_gauge;
    lv_obj_t *brew_dials__temp_gauge_full;
    lv_obj_t *brew_dials__pressure_gauge;
    lv_obj_t *brew_dials__standby_icon;
    lv_obj_t *brew_dials__menu_icon;
    lv_obj_t *brew_dials__temp_icon;
    lv_obj_t *brew_dials__pressure_icon;
    lv_obj_t *brew_dials__pressure_text;
    lv_obj_t *brew_dials__temp_text;
    lv_obj_t *brew_dials__temp_text_full;
    lv_obj_t *brew_dials__temp_gauge_2;
    lv_obj_t *brew_dials__temp_text_2;
    lv_obj_t *brew_dials__temp_text_full_2;
    lv_obj_t *status_dials;
    lv_obj_t *status_dials__temp_gauge;
    lv_obj_t *status_dials__temp_gauge_full;
    lv_obj_t *status_dials__pressure_gauge;
    lv_obj_t *status_dials__standby_icon;
    lv_obj_t *status_dials__menu_icon;
    lv_obj_t *status_dials__temp_icon;
    lv_obj_t *status_dials__pressure_icon;
    lv_obj_t *status_dials__pressure_text;
    lv_obj_t *status_dials__temp_text;
    lv_obj_t *status_dials__temp_text_full;
    lv_obj_t *status_dials__temp_gauge_2;
    lv_obj_t *status_dials__temp_text_2;
    lv_obj_t *status_dials__temp_text_full_2;
    lv_obj_t *menu_dials;
    lv_obj_t *menu_dials__temp_gauge;
    lv_obj_t *menu_dials__temp_gauge_full;
    lv_obj_t *menu_dials__pressure_gauge;
    lv_obj_t *menu_dials__standby_icon;
    lv_obj_t *menu_dials__menu_icon;
    lv_obj_t *menu_dials__temp_icon;
    lv_obj_t *menu_dials__pressure_icon;
    lv_obj_t *menu_dials__pressure_text;
    lv_obj_t *menu_dials__temp_text;
    lv_obj_t *menu_dials__temp_text_full;
    lv_obj_t *menu_dials__temp_gauge_2;
    lv_obj_t *menu_dials__temp_text_2;
    lv_obj_t *menu_dials__temp_text_full_2;
    lv_obj_t *new_menu_dials;
    lv_obj_t *new_menu_dials__temp_gauge;
    lv_obj_t *new_menu_dials__temp_gauge_full;
    lv_obj_t *new_menu_dials__pressure_gauge;
    lv_obj_t *new_menu_dials__standby_icon;
    lv_obj_t *new_menu_dials__menu_icon;
    lv_obj_t *new_menu_dials__temp_icon;
    lv_obj_t *new_menu_dials__pressure_icon;
    lv_obj_t *new_menu_dials__pressure_text;
    lv_obj_t *new_menu_dials__temp_text;
    lv_obj_t *new_menu_dials__temp_text_full;
    lv_obj_t *new_menu_dials__temp_gauge_2;
    lv_obj_t *new_menu_dials__temp_text_2;
    lv_obj_t *new_menu_dials__temp_text_full_2;
    lv_obj_t *steam_dials;
    lv_obj_t *steam_dials__temp_gauge;
    lv_obj_t *steam_dials__temp_gauge_full;
    lv_obj_t *steam_dials__pressure_gauge;
    lv_obj_t *steam_dials__standby_icon;
    lv_obj_t *steam_dials__menu_icon;
    lv_obj_t *steam_dials__temp_icon;
    lv_obj_t *steam_dials__pressure_icon;
    lv_obj_t *steam_dials__pressure_text;
    lv_obj_t *steam_dials__temp_text;
    lv_obj_t *steam_dials__temp_text_full;
    lv_obj_t *steam_dials__temp_gauge_2;
    lv_obj_t *steam_dials__temp_text_2;
    lv_obj_t *steam_dials__temp_text_full_2;
    lv_obj_t *water_dials;
    lv_obj_t *water_dials__temp_gauge;
    lv_obj_t *water_dials__temp_gauge_full;
    lv_obj_t *water_dials__pressure_gauge;
    lv_obj_t *water_dials__standby_icon;
    lv_obj_t *water_dials__menu_icon;
    lv_obj_t *water_dials__temp_icon;
    lv_obj_t *water_dials__pressure_icon;
    lv_obj_t *water_dials__pressure_text;
    lv_obj_t *water_dials__temp_text;
    lv_obj_t *water_dials__temp_text_full;
    lv_obj_t *water_dials__temp_gauge_2;
    lv_obj_t *water_dials__temp_text_2;
    lv_obj_t *water_dials__temp_text_full_2;
    lv_obj_t *profile_dials;
    lv_obj_t *profile_dials__temp_gauge;
    lv_obj_t *profile_dials__temp_gauge_full;
    lv_obj_t *profile_dials__pressure_gauge;
    lv_obj_t *profile_dials__standby_icon;
    lv_obj_t *profile_dials__menu_icon;
    lv_obj_t *profile_dials__temp_icon;
    lv_obj_t *profile_dials__pressure_icon;
    lv_obj_t *profile_dials__pressure_text;
    lv_obj_t *profile_dials__temp_text;
    lv_obj_t *profile_dials__temp_text_full;
    lv_obj_t *profile_dials__temp_gauge_2;
    lv_obj_t *profile_dials__temp_text_2;
    lv_obj_t *profile_dials__temp_text_full_2;
    lv_obj_t *grind_dials;
    lv_obj_t *grind_dials__temp_gauge;
    lv_obj_t *grind_dials__temp_gauge_full;
    lv_obj_t *grind_dials__pressure_gauge;
    lv_obj_t *grind_dials__standby_icon;
    lv_obj_t *grind_dials__menu_icon;
    lv_obj_t *grind_dials__temp_icon;
    lv_obj_t *grind_dials__pressure_icon;
    lv_obj_t *grind_dials__pressure_text;
    lv_obj_t *grind_dials__temp_text;
    lv_obj_t *grind_dials__temp_text_full;
    lv_obj_t *grind_dials__temp_gauge_2;
    lv_obj_t *grind_dials__temp_text_2;
    lv_obj_t *grind_dials__temp_text_full_2;
    lv_obj_t *obj10;
    lv_obj_t *obj10__temp_gauge;
    lv_obj_t *obj10__temp_gauge_full;
    lv_obj_t *obj10__pressure_gauge;
    lv_obj_t *obj10__standby_icon;
    lv_obj_t *obj10__menu_icon;
    lv_obj_t *obj10__temp_icon;
    lv_obj_t *obj10__pressure_icon;
    lv_obj_t *obj10__pressure_text;
    lv_obj_t *obj10__temp_text;
    lv_obj_t *obj10__temp_text_full;
    lv_obj_t *obj10__temp_gauge_2;
    lv_obj_t *obj10__temp_text_2;
    lv_obj_t *obj10__temp_text_full_2;
    lv_obj_t *time_1;
    lv_obj_t *obj11;
    lv_obj_t *touch_icon_1;
    lv_obj_t *standby_icons_2;
    lv_obj_t *wifi_icon_2;
    lv_obj_t *bluetooth_icon_2;
    lv_obj_t *update_icon_2;
    lv_obj_t *status_1;
    lv_obj_t *digital_v2;
    lv_obj_t *time_hr_1;
    lv_obj_t *time_min_1;
    lv_obj_t *digital_montserrat;
    lv_obj_t *digital_colored;
    lv_obj_t *time_hr;
    lv_obj_t *time_min;
    lv_obj_t *obj12;
    lv_obj_t *touch_icon;
    lv_obj_t *time;
    lv_obj_t *standby_icons;
    lv_obj_t *wifi_icon;
    lv_obj_t *bluetooth_icon;
    lv_obj_t *update_icon;
    lv_obj_t *status;
    lv_obj_t *obj13;
    lv_obj_t *obj14;
    lv_obj_t *start_button;
    lv_obj_t *control_container;
    lv_obj_t *mode_switch;
    lv_obj_t *bluetooth_scale_icon;
    lv_obj_t *flow_prediction_icon;
    lv_obj_t *weight_label;
    lv_obj_t *profile_info;
    lv_obj_t *obj15;
    lv_obj_t *profile_select_button;
    lv_obj_t *profile_name;
    lv_obj_t *settings_button;
    lv_obj_t *adjustments;
    lv_obj_t *temp_container;
    lv_obj_t *target_temp;
    lv_obj_t *down_temp_button;
    lv_obj_t *up_temp_button;
    lv_obj_t *obj16;
    lv_obj_t *brew_target_time_container;
    lv_obj_t *target_duration;
    lv_obj_t *obj17;
    lv_obj_t *up_duration_button;
    lv_obj_t *down_duration_button;
    lv_obj_t *brew_target_weight_container;
    lv_obj_t *target_weight_1;
    lv_obj_t *obj18;
    lv_obj_t *up_weight_button;
    lv_obj_t *down_weight_button;
    lv_obj_t *remove_volumetric_button;
    lv_obj_t *save_button;
    lv_obj_t *accept_button;
    lv_obj_t *save_as_new_button;
    lv_obj_t *obj19;
    lv_obj_t *obj20;
    lv_obj_t *target_duration_1;
    lv_obj_t *target_weight_2;
    lv_obj_t *target_temp_1;
    lv_obj_t *image7;
    lv_obj_t *image8;
    lv_obj_t *image9;
    lv_obj_t *pause_button;
    lv_obj_t *check_button;
    lv_obj_t *current_duration;
    lv_obj_t *step_label;
    lv_obj_t *phase_label;
    lv_obj_t *bar_container;
    lv_obj_t *brew_bar;
    lv_obj_t *phase_progress;
    lv_obj_t *process_volume;
    lv_obj_t *btn_brew;
    lv_obj_t *btn_steam;
    lv_obj_t *btn_water;
    lv_obj_t *btn_grind;
    lv_obj_t *btn_brew_1;
    lv_obj_t *btn_steam_1;
    lv_obj_t *btn_water_1;
    lv_obj_t *btn_grind_1;
    lv_obj_t *btn_settings_1;
    lv_obj_t *status_icons;
    lv_obj_t *obj21;
    lv_obj_t *obj22;
    lv_obj_t *obj23;
    lv_obj_t *info_btn;
    lv_obj_t *standby_btn;
    lv_obj_t *obj24;
    lv_obj_t *main_label5;
    lv_obj_t *image5_1;
    lv_obj_t *target_temp2;
    lv_obj_t *steam_down_temp_button;
    lv_obj_t *steam_up_temp_button;
    lv_obj_t *obj25;
    lv_obj_t *main_label6;
    lv_obj_t *water_down_temp_button;
    lv_obj_t *target_temp3;
    lv_obj_t *image10;
    lv_obj_t *water_up_temp_button;
    lv_obj_t *water_start_button;
    lv_obj_t *obj26;
    lv_obj_t *obj27;
    lv_obj_t *profile_name_1;
    lv_obj_t *profile_temp_time;
    lv_obj_t *obj28;
    lv_obj_t *obj29;
    lv_obj_t *obj30;
    lv_obj_t *obj31;
    lv_obj_t *obj32;
    lv_obj_t *obj33;
    lv_obj_t *obj34;
    lv_obj_t *select_profile;
    lv_obj_t *previous_profile;
    lv_obj_t *next_profile;
    lv_obj_t *main_label4;
    lv_obj_t *grind_start_button;
    lv_obj_t *mode_switch1;
    lv_obj_t *obj35;
    lv_obj_t *obj36;
    lv_obj_t *target_weight;
    lv_obj_t *target_duration3_1;
    lv_obj_t *target_symbol_1;
    lv_obj_t *grind_down_weight_button;
    lv_obj_t *grind_up_weight_button;
    lv_obj_t *target_time;
    lv_obj_t *target_duration3;
    lv_obj_t *target_symbol;
    lv_obj_t *grind_down_duration_button;
    lv_obj_t *grind_up_duration_button;
    lv_obj_t *obj37;
    lv_obj_t *standby_icons_1;
    lv_obj_t *wifi_icon_1;
    lv_obj_t *bluetooth_icon_1;
    lv_obj_t *update_icon_1;
    lv_obj_t *obj38;
    lv_obj_t *obj39;
    lv_obj_t *obj40;
    lv_obj_t *obj41;
    lv_obj_t *qrcode;
    lv_obj_t *obj42;
    lv_obj_t *info_menu_icon;
    lv_obj_t *obj43;
    lv_obj_t *single_view;
    lv_obj_t *prev_button;
    lv_obj_t *obj44;
    lv_obj_t *phase_preview;
    lv_obj_t *obj45;
    lv_obj_t *obj46;
    lv_obj_t *obj47;
    lv_obj_t *obj48;
    lv_obj_t *obj49;
    lv_obj_t *obj50;
    lv_obj_t *obj51;
    lv_obj_t *image_preview;
    lv_obj_t *profile_preview;
    lv_obj_t *obj52;
    lv_obj_t *select_button;
    lv_obj_t *next_button;
    lv_obj_t *list_view;
    lv_obj_t *obj53;
    lv_obj_t *obj54;
    lv_obj_t *obj55;
    lv_obj_t *obj56;
    lv_obj_t *obj57;
    lv_obj_t *obj58;
    lv_obj_t *obj59;
    lv_obj_t *obj60;
    lv_obj_t *obj61;
    lv_obj_t *obj62;
    lv_obj_t *obj63;
    lv_obj_t *obj64;
    lv_obj_t *obj65;
    lv_obj_t *obj66;
    lv_obj_t *obj67;
    lv_obj_t *obj68;
    lv_obj_t *obj69;
    lv_obj_t *obj70;
    lv_obj_t *obj71;
    lv_obj_t *obj72;
    lv_obj_t *obj73;
    lv_obj_t *obj74;
    lv_obj_t *obj75;
    lv_obj_t *obj76;
    lv_obj_t *obj77;
    lv_obj_t *obj78;
    lv_obj_t *obj79;
} objects_t;

extern objects_t objects;

typedef struct {
    lv_meter_scale_t *scale;
    lv_meter_scale_t *scale1;
    lv_meter_indicator_t *min_hand_1;
    lv_meter_indicator_t *min_hand_2;
    lv_meter_scale_t *scale2;
    lv_meter_indicator_t *indicator;
    lv_meter_indicator_t *hour_hand;
    lv_meter_scale_t *scale3;
    lv_meter_indicator_t *sec_hand;
    lv_meter_indicator_t *sec_hand_2;
} user_widget_clock_state_t;

typedef struct {
    lv_meter_scale_t *scale;
    lv_meter_scale_t *scale1;
    lv_meter_indicator_t *min_hand_1;
    lv_meter_indicator_t *min_hand_2;
    lv_meter_scale_t *scale2;
    lv_meter_indicator_t *indicator;
    lv_meter_indicator_t *hour_hand;
    lv_meter_scale_t *scale3;
    lv_meter_indicator_t *sec_hand;
    lv_meter_indicator_t *sec_hand_2;
} user_widget_clock_1_state_t;

typedef struct {
    lv_meter_scale_t *scale;
    lv_meter_indicator_t *min_hand_1;
    lv_meter_indicator_t *min_hand_2;
    lv_meter_scale_t *scale1;
    lv_meter_indicator_t *indicator;
    lv_meter_indicator_t *hour_hand;
} user_widget_clock_2_state_t;

typedef struct {
    lv_meter_scale_t *scale;
    lv_meter_indicator_t *min_hand_1;
    lv_meter_indicator_t *min_hand_2;
    lv_meter_scale_t *scale1;
    lv_meter_indicator_t *indicator;
    lv_meter_indicator_t *hour_hand;
} user_widget_clock_3_state_t;

typedef struct {
    lv_meter_scale_t *scale;
    lv_meter_indicator_t *hour_hand;
    lv_meter_scale_t *scale1;
    lv_meter_indicator_t *min_hand_2;
    lv_meter_scale_t *scale2;
    lv_meter_indicator_t *sec_hand_2;
} user_widget_clock_minimal_hand_state_t;

typedef struct {
    lv_meter_scale_t *scale;
    lv_meter_indicator_t *indicator;
    lv_meter_scale_t *scale1;
    lv_meter_indicator_t *indicator1;
    lv_meter_scale_t *scale2;
    lv_meter_indicator_t *indicator2;
} user_widget_clock_minimal_arc_state_t;

typedef struct {
    lv_meter_scale_t *scale;
    lv_meter_scale_t *scale1;
} user_widget_clock_minimal_point_state_t;

typedef struct {
    lv_meter_scale_t *scale;
    lv_meter_indicator_t *min_hand_2;
    lv_meter_scale_t *scale1;
    lv_meter_indicator_t *hour_hand;
} user_widget_clock_minimal_hand_short_state_t;

typedef struct {
    lv_meter_scale_t *scale;
    lv_meter_indicator_t *hour_hand;
    lv_meter_scale_t *scale1;
    lv_meter_indicator_t *min_hand_2;
} user_widget_clock_minimal_hand_1_state_t;

typedef struct {
    user_widget_clock_state_t clock1_state;
    user_widget_clock_1_state_t clock_11_state;
    user_widget_clock_2_state_t clock_21_state;
    user_widget_clock_3_state_t clock_31_state;
    user_widget_clock_minimal_hand_state_t clock_minimal_hand1_state;
    user_widget_clock_minimal_arc_state_t clock_minimal_arc1_state;
    user_widget_clock_minimal_point_state_t clock_minimal_point1_state;
    user_widget_clock_minimal_hand_short_state_t clock_minimal_hand_short1_state;
    user_widget_clock_minimal_hand_1_state_t clock_minimal_hand_11_state;
} screen_new_standby_screen_state_t;

typedef struct {
    lv_meter_scale_t *scale;
    lv_meter_indicator_t *indicator;
    lv_meter_indicator_t *indicator1;
    lv_meter_scale_t *scale1;
    lv_meter_indicator_t *indicator2;
    lv_meter_indicator_t *indicator3;
    lv_meter_scale_t *scale2;
    lv_meter_indicator_t *indicator4;
    lv_meter_indicator_t *indicator5;
    lv_meter_scale_t *scale3;
    lv_meter_indicator_t *indicator6;
} user_widget_dials_state_t;

typedef struct {
    user_widget_dials_state_t brew_dials;
} screen_brew_screen_state_t;

typedef struct {
    user_widget_dials_state_t status_dials;
} screen_status_screen_state_t;

typedef struct {
    user_widget_dials_state_t menu_dials;
} screen_menu_screen_state_t;

typedef struct {
    user_widget_dials_state_t new_menu_dials;
} screen_menu_screen_new_state_t;

typedef struct {
    user_widget_dials_state_t steam_dials;
} screen_steam_screen_state_t;

typedef struct {
    user_widget_dials_state_t water_dials;
} screen_water_screen_state_t;

typedef struct {
    user_widget_dials_state_t profile_dials;
} screen_profile_screen_state_t;

typedef struct {
    user_widget_dials_state_t grind_dials;
} screen_grind_screen_state_t;

typedef struct {
    user_widget_dials_state_t dials1_state;
} screen_info_screen_state_t;

typedef struct {
    lv_meter_scale_t *scale;
    lv_meter_indicator_t *indicator;
} user_widget_timer_w_state_t;

typedef struct {
    lv_meter_scale_t *scale;
    lv_meter_indicator_t *indicator;
} user_widget_binary_clock_1_state_t;

extern screen_new_standby_screen_state_t screen_new_standby_screen_state;
extern screen_brew_screen_state_t screen_brew_screen_state;
extern screen_status_screen_state_t screen_status_screen_state;
extern screen_menu_screen_state_t screen_menu_screen_state;
extern screen_menu_screen_new_state_t screen_menu_screen_new_state;
extern screen_steam_screen_state_t screen_steam_screen_state;
extern screen_water_screen_state_t screen_water_screen_state;
extern screen_profile_screen_state_t screen_profile_screen_state;
extern screen_grind_screen_state_t screen_grind_screen_state;
extern screen_info_screen_state_t screen_info_screen_state;

void create_screen_new_standby_screen();
void delete_screen_new_standby_screen();
void tick_screen_new_standby_screen();

void create_screen_standby_screen();
void delete_screen_standby_screen();
void tick_screen_standby_screen();

void create_screen_brew_screen();
void delete_screen_brew_screen();
void tick_screen_brew_screen();

void create_screen_status_screen();
void delete_screen_status_screen();
void tick_screen_status_screen();

void create_screen_menu_screen();
void delete_screen_menu_screen();
void tick_screen_menu_screen();

void create_screen_menu_screen_new();
void delete_screen_menu_screen_new();
void tick_screen_menu_screen_new();

void create_screen_steam_screen();
void delete_screen_steam_screen();
void tick_screen_steam_screen();

void create_screen_water_screen();
void delete_screen_water_screen();
void tick_screen_water_screen();

void create_screen_profile_screen();
void delete_screen_profile_screen();
void tick_screen_profile_screen();

void create_screen_grind_screen();
void delete_screen_grind_screen();
void tick_screen_grind_screen();

void create_screen_info_screen();
void delete_screen_info_screen();
void tick_screen_info_screen();

void create_screen_new_profile_screen();
void delete_screen_new_profile_screen();
void tick_screen_new_profile_screen();

void create_user_widget_dials(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex, user_widget_dials_state_t *state);
void tick_user_widget_dials(void *flowState, int startWidgetIndex, user_widget_dials_state_t *state);

void create_user_widget_clock(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex, user_widget_clock_state_t *state);
void tick_user_widget_clock(void *flowState, int startWidgetIndex, user_widget_clock_state_t *state);

void create_user_widget_timer_w(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex, user_widget_timer_w_state_t *state);
void tick_user_widget_timer_w(void *flowState, int startWidgetIndex, user_widget_timer_w_state_t *state);

void create_user_widget_binary_clock(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex);
void tick_user_widget_binary_clock(void *flowState, int startWidgetIndex);

void create_user_widget_clock_1(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex, user_widget_clock_1_state_t *state);
void tick_user_widget_clock_1(void *flowState, int startWidgetIndex, user_widget_clock_1_state_t *state);

void create_user_widget_clock_2(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex, user_widget_clock_2_state_t *state);
void tick_user_widget_clock_2(void *flowState, int startWidgetIndex, user_widget_clock_2_state_t *state);

void create_user_widget_clock_3(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex, user_widget_clock_3_state_t *state);
void tick_user_widget_clock_3(void *flowState, int startWidgetIndex, user_widget_clock_3_state_t *state);

void create_user_widget_binary_clock_1(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex, user_widget_binary_clock_1_state_t *state);
void tick_user_widget_binary_clock_1(void *flowState, int startWidgetIndex, user_widget_binary_clock_1_state_t *state);

void create_user_widget_clock_minimal_hand(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex, user_widget_clock_minimal_hand_state_t *state);
void tick_user_widget_clock_minimal_hand(void *flowState, int startWidgetIndex, user_widget_clock_minimal_hand_state_t *state);

void create_user_widget_clock_minimal_arc(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex, user_widget_clock_minimal_arc_state_t *state);
void tick_user_widget_clock_minimal_arc(void *flowState, int startWidgetIndex, user_widget_clock_minimal_arc_state_t *state);

void create_user_widget_clock_minimal_point(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex, user_widget_clock_minimal_point_state_t *state);
void tick_user_widget_clock_minimal_point(void *flowState, int startWidgetIndex, user_widget_clock_minimal_point_state_t *state);

void create_user_widget_clock_minimal_hand_short(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex, user_widget_clock_minimal_hand_short_state_t *state);
void tick_user_widget_clock_minimal_hand_short(void *flowState, int startWidgetIndex, user_widget_clock_minimal_hand_short_state_t *state);

void create_user_widget_clock_minimal_hand_1(lv_obj_t *parent_obj, void *flowState, int startWidgetIndex, user_widget_clock_minimal_hand_1_state_t *state);
void tick_user_widget_clock_minimal_hand_1(void *flowState, int startWidgetIndex, user_widget_clock_minimal_hand_1_state_t *state);

void create_screen_by_id(enum ScreensEnum screenId);
void delete_screen_by_id(enum ScreensEnum screenId);
void tick_screen_by_id(enum ScreensEnum screenId);
void tick_screen(int screen_index);

void create_screens();

// Color themes

enum Themes {
    THEME_ID_DARK,
    THEME_ID_LIGHT,
    THEME_ID_AMOLED_DARK,
    THEME_ID_MC_INTOSH,
    THEME_ID_ELECTRIC_CIRCUS,
    THEME_ID_ARCADE_GLOW,
    THEME_ID_NEON,
    THEME_ID_SYNTHWAVE,
    THEME_ID_DISCO,
    THEME_ID_SUNSET,
    THEME_ID_SUNRISE,
    THEME_ID_COFFEE,
    THEME_ID_ESPRESSO,
    THEME_ID_MATCHA,
    THEME_ID_FOREST,
    THEME_ID_OCEAN,
    THEME_ID_LAGOON,
    THEME_ID_ARCTIC,
    THEME_ID_ICE,
    THEME_ID_CHERRY,
    THEME_ID_ROSE,
    THEME_ID_LAVENDER,
    THEME_ID_CYBERPUNK,
    THEME_ID_TERMINAL,
    THEME_ID_MATRIX,
    THEME_ID_NORD,
    THEME_ID_DRACULA,
    THEME_ID_GRUVBOX,
    THEME_ID_SOLARIZED,
    THEME_ID_DESERT,
    THEME_ID_VOLCANO,
    THEME_ID_CANDY,
    THEME_ID_RETRO,
    THEME_ID_AURORA,
    THEME_ID_ROYAL,
    THEME_ID_NEON_ALLEY_DARK,
    THEME_ID_NEON_ALLEY_LIGHT,
    THEME_ID_CAFE_STATIC_DARK,
    THEME_ID_CAFE_STATIC_LIGHT,
    THEME_ID_DISCO_MEMORY_DARK,
    THEME_ID_DISCO_MEMORY_LIGHT,
    THEME_ID_SOFT_HORIZON_LIGHT,
    THEME_ID_OVERGROWN_DARK,
    THEME_ID_OVERGROWN_LIGHT,
    THEME_ID_GLITCH_ICE_DARK,
    THEME_ID_DEEP_SPACE_DARK,
    THEME_ID_DEEP_SPACE_LIGHT,
};
enum Colors {
    COLOR_ID_DARK,
    COLOR_ID_NICE_WHITE,
    COLOR_ID_PROGRESS,
    COLOR_ID_HEATING,
    COLOR_ID_SEMI_DARK,
    COLOR_ID_TICKS,
    COLOR_ID_TEMPERATURE,
    COLOR_ID_PRESSURE,
};
void change_color_theme(uint32_t themeIndex);
extern uint32_t theme_colors[47][8];

#ifdef __cplusplus
}
#endif

#endif /*EEZ_LVGL_UI_SCREENS_H*/