import React, { useState } from 'react';
import * as yup from "yup";
import { ErrorMessage, Field, Form, Formik } from 'formik'
import { useStyles } from './styles';

export default function FormInput({ selectedPhim, onUpdate, onAddMovie, listCinemaSystem }) {
    const classes = useStyles();

  
    const movieSchema = yup.object().shape({
      tenTheLoai: yup.string().required("*Không được bỏ trống!"),
    });
  
    const handleSubmit = (movieObj) => {
      // ✅ Có id => update, không có => add
      if (selectedPhim?.id) {
        onUpdate({ ...movieObj, id: selectedPhim.id });
        return;
      }
      onAddMovie({ ...movieObj });
    };
  
  

  
    return (
      <Formik
        enableReinitialize
        initialValues={{
          tenTheLoai: selectedPhim?.tenTheLoai || "",
        }}
        validationSchema={movieSchema}
        onSubmit={handleSubmit}
      >
        {(formikProp) => (
          <Form>
            <div className="form-group">
              <label>Tên Thể Loại Phim&nbsp;</label>
              <ErrorMessage name="tenTheLoai" render={msg => <span className="text-danger">{msg}</span>} />
              <Field name="tenTheLoai" className="form-control" />
            </div>
            <button type="submit" className="form-control">Submit</button>
          </Form>
        )}
      </Formik>
    );
  }

